import { type BodyOptions, BodyType } from './Body.ts'
import { type SeededRng } from './seeded-rng.ts'
import type { Coord } from '../types.ts'
import { G } from '../config.ts'
import type { Texture } from 'pixi.js'

export type BodyGeneratorSettings = {
  center: Coord,
  startDistanceMax: number,
  blackHoleMass: number,
  massMin: number,
  massMax: number,
  startVelocityVarianceMin: number,
  startVelocityVarianceMax: number,
  bodiesCount: number,
  rng: SeededRng,
  bodyTexture: Texture
}

export const bodyGenerator = (
  {
    center,
    startDistanceMax,
    bodiesCount,
    blackHoleMass,
    massMin,
    massMax,
    startVelocityVarianceMin,
    startVelocityVarianceMax,
    rng,
    bodyTexture,
  }: BodyGeneratorSettings,
) => {

  const bodies: BodyOptions[] = []

  const blackHole = {
    x: center.x,
    y: center.y,
    mass: blackHoleMass,
    type: BodyType.BLACK_HOLE,
    rng,
    texture: bodyTexture
  }

  bodies.push(blackHole)

  for (let i = 0; i < bodiesCount; i++) {
    const angle = rng() * Math.PI * 2
    const distance = 50 + (i / bodiesCount) * startDistanceMax

    const x = center.x + Math.cos(angle) * distance
    const y = center.y + Math.sin(angle) * distance

    const baseSpeed = Math.sqrt(G * blackHoleMass / distance)

    // Calculate orbital velocity with some variation
    const speedMultiplier = rng.range(startVelocityVarianceMin, startVelocityVarianceMax)
    const orbitalSpeed = baseSpeed * speedMultiplier

    const vx = -Math.sin(angle) * orbitalSpeed
    const vy = Math.cos(angle) * orbitalSpeed

    const mass = rng.range(massMin, massMax)

    bodies.push({
      x,
      y,
      vx,
      vy,
      mass,
      rng,
      texture: bodyTexture,
    })
  }

  return bodies
}

export const testBodyGenerator = (
  {
    center,
    rng,
    bodyTexture,
  }: BodyGeneratorSettings,
) => {
  const result: BodyOptions[] = []

  result.push({
    x: center.x - 5,
    y: center.y,
    vx: 10,
    vy: 10,
    mass: 100,
    type: BodyType.STAR,
    texture: bodyTexture,
    rng,
  })

  result.push({
    x: center.x + 5,
    y: center.y,
    vx: -10,
    vy: -10,
    mass: 150,
    type: BodyType.STAR,
    texture: bodyTexture,
    rng,
  })
  return result
}

export type BodyGeneratorPreset = Required<Omit<BodyGeneratorSettings, 'seed' | 'center' | 'bodyTexture' | 'rng'>> & {
  name: string
}