import { Graphics } from 'pixi.js'
import { DRAW_CONFIG as c } from '../config.ts'
import type { Coord } from '../types.ts'
import type { Body } from './Body.ts'

export class BodyPath extends Graphics {

  public trail: Coord[] = []

  reset() {
    this.trail = []
    this.clear()
  }

  update(body: Body) {
    if (this.trail.length >= c.MAX_LINE_SEGMENTS) {
      this.trail.shift()
    }

    this.trail.push({
      x: body.x,
      y: body.y,
    })

    this.clear()

    const first = this.trail[0] as Coord
    this.moveTo(first.x, first.y)

    for (let i = 1; i < this.trail.length; i++) {
      const p = this.trail[i] as Coord
      this.lineTo(p.x, p.y)
    }
    this.stroke({ width: .1, color: body.tint })
  }
}