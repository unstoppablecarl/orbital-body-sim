import { Particle, type ParticleOptions, Pool, type Texture } from 'pixi.js'
import { mixColors, randomColor } from '../pixi/color.ts'
import type { Coord } from '../types.ts'
import type { SeededRng } from './seeded-rng.ts'
import { BODY_SPRITE_SIZE, DRAW_CONFIG as d, G, SIM_CONFIG as c, UNIVERSE_SIZE } from '../config.ts'
import { BodyPath } from './BodyPath.ts'

export enum BodyType {
  BLACK_HOLE,
  STAR
}

export const massToRadius = (mass: number) => Math.sqrt(mass)

export const radiusToScale = (radius: number) => (radius * 2) / BODY_SPRITE_SIZE

export type BodyOptions = {
  texture?: Texture,
  mass: number,
  rng: SeededRng,
  x?: number,
  y?: number,
  vx?: number,
  vy?: number,
  type?: BodyType,
  fragmentCooldown?: number,
  tint?: number,
}
export type FragmentOptions = {
  x: number,
  y: number,
  vx: number,
  vy: number,
  mass: number,
  fragmentCooldown: number,
  rng: SeededRng,
  texture: Texture,
}

export class Body extends Particle {
  public type: BodyType = BodyType.STAR
  public radius: number = 0
  public mass: number = 0
  public toRemove: boolean = false

  public vx: number = 0
  public vy: number = 0

  // Prevent rapid re-fragmentation cascades
  public fragmentCooldown: number = 0

  public trailDistAccumulator = 0
  public lineAccumulator = 0

  public rng!: SeededRng
  public path: BodyPath

  constructor(options: ParticleOptions) {
    super(options)
    this.path = new BodyPath()
    this.anchorX = this.anchorY = 0.5
  }

  reset() {
    this.path.reset()
    this.lineAccumulator = 0
    this.trailDistAccumulator = 0
    this.fragmentCooldown = 0
    this.toRemove = false
  }

  init(options: BodyOptions) {
    if (options.mass <= 0) {
      throw new Error('invalid mass')
    }
    this.rng = options.rng
    this.x = options.x ?? 0
    this.y = options.y ?? 0
    this.vx = options.vx ?? 0
    this.vy = options.vy ?? 0
    this.type = options.type ?? BodyType.STAR
    this.fragmentCooldown = options.fragmentCooldown ?? 0
    this.tint = options.tint ?? randomColor(this.rng)
    this.setMass(options.mass)
  }

  setMass(mass: number) {
    this.mass = mass
    this.radius = massToRadius(this.mass)
    if (this.type == BodyType.BLACK_HOLE) {
      this.radius = 10
    }
    this.scaleX = this.scaleY = radiusToScale(this.radius)
  }

  updateGrav(bodies: Body[], deltaTime: number): { particles?: Coord[], fragments?: FragmentOptions[] } {
    if (this.toRemove || this.type === BodyType.BLACK_HOLE) return {}

    if (
      this.x > UNIVERSE_SIZE ||
      this.x < -UNIVERSE_SIZE ||
      this.y > UNIVERSE_SIZE ||
      this.y < -UNIVERSE_SIZE
    ) {
      this.toRemove = true
    }

    // Tick down fragmentation cooldown to prevent cascades
    if (this.fragmentCooldown > 0) {
      this.fragmentCooldown = Math.max(0, this.fragmentCooldown - deltaTime)
    }

    let ax = 0
    let ay = 0
    const fragments: Body[] = []

    // gravity
    for (const other of bodies) {
      if (other === this || other.toRemove) continue

      const dx = other.x - this.x
      const dy = other.y - this.y
      const distSq = dx * dx + dy * dy
      const dist = Math.sqrt(distSq)
      const minDist = this.radius + other.radius

      // collisions
      if (dist < minDist) {
        const dvx = other.vx - this.vx
        const dvy = other.vy - this.vy
        const relativeSpeed = Math.sqrt(dvx * dvx + dvy * dvy)

        const reducedMass = (this.mass * other.mass) / (this.mass + other.mass)
        const impactEnergy = 0.5 * reducedMass * relativeSpeed * relativeSpeed

        const bindingEnergy = c.BINDING_CONSTANT * G * (this.mass + other.mass)

        const otherIsBlackHole = other.type === BodyType.BLACK_HOLE
        const tooSmall = this.mass + other.mass <= c.MIN_MASS * 2
        const onCooldown = this.fragmentCooldown > 0 || other.fragmentCooldown > 0

        if (onCooldown) {
          continue
        }
        if (tooSmall || otherIsBlackHole || impactEnergy < bindingEnergy) {
          // gentle → merge
          this.merge(other)
          // Stop processing this body for the rest of the tick to avoid double counting
          return {}
        } else {
          // violent → break apart
          // Stop processing this body for the rest of the tick
          return {
            fragments: this.breakApart(other, impactEnergy),
          }
        }
      }

      const softening = 0.1
      const invDist3 = 1 / Math.pow(distSq + softening * softening, 1.5)

      ax += G * other.mass * dx * invDist3
      ay += G * other.mass * dy * invDist3
    }

    // integrate velocity
    this.vx += ax * deltaTime
    this.vy += ay * deltaTime

    // integrate position
    const oldX = this.x
    const oldY = this.y

    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    // particle emission
    const dx = this.x - oldX
    const dy = this.y - oldY
    const segDist = Math.sqrt(dx * dx + dy * dy)

    // particle emission
    const emitted: Coord[] = []
    this.trailDistAccumulator += segDist
    const distancePerParticle = this.radius * 0.5
    while (this.trailDistAccumulator >= distancePerParticle) {
      const overshoot = this.trailDistAccumulator - distancePerParticle
      const t = 1 - overshoot / segDist

      emitted.push({
        x: oldX + dx * t,
        y: oldY + dy * t,
      })

      this.trailDistAccumulator -= distancePerParticle
    }

    // line draw
    this.lineAccumulator += segDist
    if (this.lineAccumulator > d.DIST_PER_LINE_SEGMENT) {
      if (d.DRAW_LINES) {
        this.path.update(this)
      }
      this.lineAccumulator = 0
    }

    return {
      particles: emitted,
      fragments,
    }
  }

  merge(other: Body) {
    let smaller: Body
    let bigger: Body

    if (other.type === BodyType.BLACK_HOLE) {
      smaller = this
      bigger = other
    } else if (this.type === BodyType.BLACK_HOLE) {
      smaller = other
      bigger = this
    } else if (this.mass < other.mass) {
      smaller = this
      bigger = other
    } else {
      smaller = other
      bigger = this
    }

    smaller.toRemove = true

    const totalMass = this.mass + other.mass
    const newVx = (this.mass * this.vx + other.mass * other.vx) / totalMass
    const newVy = (this.mass * this.vy + other.mass * other.vy) / totalMass
    bigger.vx = newVx
    bigger.vy = newVy
    bigger.setMass(totalMass)

    if (bigger.type !== BodyType.BLACK_HOLE) {
      bigger.tint = mixColors(smaller.tint, bigger.tint, smaller.mass / bigger.mass)
    }
  }

  breakApart(other: Body, impactEnergy: number): FragmentOptions[] {
    this.toRemove = true
    other.toRemove = true

    const totalMass = this.mass + other.mass
    const fragments: FragmentOptions[] = []

    // center of mass
    const cx = (this.x * this.mass + other.x * other.mass) / totalMass
    const cy = (this.y * this.mass + other.y * other.mass) / totalMass
    const cvx = (this.vx * this.mass + other.vx * other.mass) / totalMass
    const cvy = (this.vy * this.mass + other.vy * other.mass) / totalMass

    const fragmentMasses = generateFragmentMasses(this.rng, totalMass)
    const totalFragmentMass1 = fragmentMasses.reduce((sum, mass) => sum + mass, 0)
    const eps = 1e-9
    if (totalFragmentMass1 > totalMass + eps) {
      const diff = totalFragmentMass1 - totalMass
      throw new Error('1 fragment mass exceeds original: ' + diff)
    }

    // base scatter velocity
    const baseSpeed = Math.sqrt(impactEnergy / totalMass)
    let vxSum = 0
    let vySum = 0

    for (let i = 0; i < fragmentMasses.length; i++) {
      const mass = fragmentMasses[i] as number
      const angle = this.rng() * Math.PI * 2

      const vx = Math.cos(angle) * baseSpeed
      const vy = Math.sin(angle) * baseSpeed

      vxSum += vx * mass
      vySum += vy * mass

      fragments.push({
        x: cx + Math.cos(angle) * (this.radius * 0.5) + vx,
        y: cy + Math.sin(angle) * (this.radius * 0.5) + vy,
        vx: vx * c.EXPLOSIVE_FORCE,
        vy: vy * c.EXPLOSIVE_FORCE,
        mass,
        fragmentCooldown: c.FRAGMENT_COOLDOWN_SECONDS,
        rng: this.rng,
        texture: this.texture,
      })
    }

    // momentum correction
    const totalFragmentMass = fragments.reduce((sum, f) => sum + f.mass, 0)
    const cmVxError = vxSum / totalFragmentMass
    const cmVyError = vySum / totalFragmentMass

    for (const frag of fragments) {
      frag.vx = frag.vx - cmVxError + cvx
      frag.vy = frag.vy - cmVyError + cvy
    }

    const totalFragmentMass3 = fragments.reduce((sum, f) => sum + f.mass, 0)
    const eps2 = 1e-9
    if (totalFragmentMass3 > this.mass + other.mass + eps2) {
      throw new Error('2 fragment mass exceeds original')
    }

    return fragments
  }
}

function generateFragmentMasses(rng: SeededRng, totalMass: number): number[] {
  if (totalMass < c.MIN_MASS * 2) {
    throw new Error('fragmenting parts that are too small')
  }

  const maxChunksPossible = Math.floor(totalMass / c.MIN_MASS)
  const numChunks = Math.min(maxChunksPossible, c.MAX_FRAGMENT_COUNT)
  if (numChunks < 2) {
    return [totalMass]
  }

  const minChunk = c.MIN_MASS / totalMass
  const portions = rng.chunks({ minCount: 2, maxCount: numChunks, minChunk })

  // find the largest mass to normalize
  let sum = 0
  let maxMass = 0
  let maxIdx = 0

  const masses = portions.map((p, i) => {
    const mass = p * totalMass
    sum += mass
    if (mass > maxMass) {
      maxMass = mass
      maxIdx = i
    }
    return mass
  })

  const diff = sum - totalMass
  if (diff !== 0) {
    masses[maxIdx]! -= diff
  }

  return masses
}

export function makeBodyPool(texture: Texture, count: number) {
  class BodyFactory {
    constructor() {
      return new Body({ texture })
    }
  }

  return new Pool(BodyFactory as new () => Body, count)
}