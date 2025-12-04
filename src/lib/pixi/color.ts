import { type SeededRng } from '../simulation/seeded-rng.ts'
import { Color } from 'pixi.js'

export function randomColor(rng: SeededRng) {
  return new Color({
    h: Math.floor(rng() * 255 + 1),
    s: 255,
    l: rng.range(50, 90),
  })
}

export function mixColors(color1: number, color2: number, ratio = 0.5) {
  const r1 = (color2 >> 16) & 0xFF
  const g1 = (color2 >> 8) & 0xFF
  const b1 = color2 & 0xFF

  const r2 = (color1 >> 16) & 0xFF
  const g2 = (color1 >> 8) & 0xFF
  const b2 = color1 & 0xFF

  // Mix the colors (ratio 0 = color1, ratio 1 = color2)
  const r = Math.round(r1 + (r2 - r1) * ratio)
  const g = Math.round(g1 + (g2 - g1) * ratio)
  const b = Math.round(b1 + (b2 - b1) * ratio)

  return (r << 16) | (g << 8) | b
}
