import { Particle, type Texture } from 'pixi.js'
import type { Body } from '../simulation/Body.ts'
import type { Coord } from '../types.ts'
import { DRAW_CONFIG as c } from '../config.ts'

type ParticleInit = {
  body: Body,
  coord: Coord,
}

export class TrailParticle extends Particle {
  public initialScale: number = 1
  public initialAlpha: number = 0.3

  static texture: Texture

  static setTexture(texture: Texture) {
    TrailParticle.texture = texture
  }

  public vx: number = 0
  public vy: number = 0

  public age: number = 0

  public body?: Body

  anchorX = 0.5
  anchorY = 0.5

  constructor() {
    if (TrailParticle.texture === undefined) {
      throw new Error('Particle Trail Texture not defined')
    }
    super({ texture: TrailParticle.texture })
    this.reset()
  }

  reset() {
    this.scaleX = 0
    this.scaleY = 0
    this.alpha = 0
    this.age = 0
    this.body = undefined
  }

  init({ body, coord }: ParticleInit) {

    this.body = body

    this.x = coord.x
    this.y = coord.y
    this.initialScale = body.scaleX * c.PARTICLE_INITIAL_SCALE_OF_BODY
    this.tint = body.tint
    this.alpha = this.initialAlpha

    const drift = 0.1

    this.vx = randomRange(-drift, drift)
    this.vy = randomRange(-drift, drift)
  }

  update(deltaTime: number): boolean {
    this.age += deltaTime

    const percent = this.age / c.TRAIL_PARTICLE_LIFESPAN
    const percentRemaining = 1 - percent

    this.alpha = percentRemaining * this.initialAlpha

    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    this.scaleX = this.scaleY = percentRemaining * this.initialScale
    return percent > 1
  }
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}