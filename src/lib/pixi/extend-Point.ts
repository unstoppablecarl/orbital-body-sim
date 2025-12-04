import { Point, type PointData } from 'pixi.js'

export class PointExtra extends Point {
  rotateDegrees<T extends PointData>(degrees: number, outPoint?: T): T {
    if (!outPoint) {
      outPoint = new Point() as PointData as T
    }

    // Convert angle from degrees to radians
    const angleInRadians = degrees * (Math.PI / 180)

    const cosTheta = Math.cos(angleInRadians);
    const sinTheta = Math.sin(angleInRadians);

    outPoint.x = (this.x * cosTheta) - (this.y * sinTheta);
    outPoint.y = (this.x * sinTheta) + (this.y * cosTheta);

    return outPoint
  }
}