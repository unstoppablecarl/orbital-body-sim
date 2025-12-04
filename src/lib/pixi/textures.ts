import { Application, FillGradient, Graphics, type Renderer, type Texture } from 'pixi.js'
import { BODY_SPRITE_SIZE as size } from '../config.ts'

const bodySprite = new Graphics()
  .circle(size, size, size * 0.5)
  .fill(0xffffff)

const trailGradient = new FillGradient({
  type: 'radial',
  colorStops: [
    { offset: 0, color: 'rgba(255,255,255,1)' },
    { offset: 1, color: 'rgba(255,255,255,0)' },
  ],
})

const trailSprite = new Graphics()
  .circle(size, size, size * 0.5)
  .fill(trailGradient)

const blackHoleGradient = new FillGradient({
  type: 'radial',
  colorStops: [
    { offset: 1, color: 'rgba(200,200,240,1)' },
    { offset: 0.7, color: 'rgba(0,0,0,1)' },
  ],
})

const blackHoleSprite = new Graphics()
  .clear()
  .circle(size, size, size * 0.5)
  .fill(blackHoleGradient)
  .stroke({
    width: 5,
    color: 0xffffff,
  })

let blackHoleTexture: Texture
let bodyTexture: Texture
let trailTexture: Texture

export function getTextures(app: Application<Renderer>) {
  if (!bodyTexture) {
    bodyTexture = app.renderer.generateTexture(bodySprite)
  }

  if (!trailTexture) {
    trailTexture = app.renderer.generateTexture(trailSprite)
  }

  if (!blackHoleTexture) {
    blackHoleTexture = app.renderer.generateTexture(blackHoleSprite)
  }

  return {
    bodyTexture,
    trailTexture,
    blackHoleTexture,
  }
}