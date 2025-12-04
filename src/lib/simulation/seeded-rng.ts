export type ChunksOptions = {
  count?: number,
  minCount?: number,
  maxCount?: number,
  minChunk?: number,
}

export type ChunksFn = {
  (count: number, minChunk?: number): number[]
  (opts: ChunksOptions): number[]
}

export type SeededRng = {
  (): number,
  range: (min: number, max: number) => number
  negToPos: (val: number) => number
  array: <T>(arr: T[]) => T
  reset: () => void
  setSeed: (seed: number) => SeededRng,
  chunks: ChunksFn,
}

export const RNG: SeededRng = makeSeededRng()

export function makeSeededRng(seed?: number) {
  const initialSeed = seed ?? Math.floor(Math.random() * 1000000)
  let rngState = initialSeed

  function seededRandom(val: number = 1) {
    rngState = (rngState * 1664525 + 1013904223) >>> 0  // keep as uint32
    const result = rngState / 0x1_0000_0000  // 2^32
    return result * val
  }

  function chunks(arg1: number | ChunksOptions, arg2?: number): number[] {
    let count: number
    let minChunk = 0

    if (typeof arg1 === 'number') {
      count = Math.trunc(arg1)
      if (!Number.isFinite(count)) throw new Error('count must be finite')
      if (arg2 !== undefined) minChunk = arg2
    } else {
      const opts = arg1 || {}
      const { count: c, minCount, maxCount } = opts as ChunksOptions
      minChunk = (opts as ChunksOptions).minChunk ?? 0
      if (c != null) {
        if (!Number.isFinite(c)) throw new Error('count must be finite')
        count = Math.trunc(c)
      } else {
        if (!Number.isFinite(minCount as number) || !Number.isFinite(maxCount as number)) {
          throw new Error('Provide either count or finite minCount/maxCount')
        }
        if ((minCount as number) > (maxCount as number)) throw new Error('minCount > maxCount')
        // inclusive integer range
        count = Math.floor(seededRandom() * (((maxCount as number) + 1) - (minCount as number)) + (minCount as number))
      }
    }

    if (count <= 0) return []

    if (!Number.isFinite(minChunk)) throw new Error('minChunk must be finite')
    if (minChunk < 0) minChunk = 0

    if (count === 1) {
      if (minChunk > 1) throw new Error('minChunk too large for count=1')
      return [1]
    }

    const eps = 1e-12
    const reserved = minChunk * count

    if (Math.abs(reserved - 1) <= eps) {
      return new Array(count).fill(1 / count)
    }

    if (reserved > 1 + eps) {
      throw new Error(`minChunk too large: count * minChunk = ${reserved} > 1`)
    }

    const remaining = Math.max(0, 1 - reserved)

    const points: number[] = []
    for (let i = 0; i < count - 1; i++) points.push(seededRandom())
    points.sort((a, b) => a - b)

    const portions: number[] = [points[0]!]
    for (let i = 1; i < points.length; i++) portions.push(points[i]! - points[i - 1]!)
    portions.push(1 - points[points.length - 1]!)

    for (let i = 0; i < portions.length; i++) if (portions[i]! < 0 && portions[i]! > -eps) portions[i] = 0

    const out: number[] = new Array(count)
    for (let i = 0; i < count; i++) out[i] = minChunk + portions[i]! * remaining

    let sum = 0
    for (const c of out) sum += c
    if (sum !== 0 && Math.abs(sum - 1) > eps) {
      for (let i = 0; i < out.length; i++) out[i]! /= sum
    }

    for (let i = 0; i < out.length; i++) if (out[i]! < 0 && out[i]! > -eps) out[i] = 0

    return out
  }

  Object.assign(seededRandom, {
    range(min: number, max: number): number {
      return seededRandom() * (max - min) + min
    },
    negToPos(val: number): number {
      return seededRandom() * (val * 2) - val
    },
    array<T>(arr: T[]): T {
      const index = Math.floor(seededRandom() * arr.length)
      return arr[index] as T
    },

    reset(): void {
      rngState = initialSeed
    },

    setSeed(seed: number) {
      rngState = seed
      return seededRandom
    },
    chunks: chunks,
  })

  return seededRandom as SeededRng
}
