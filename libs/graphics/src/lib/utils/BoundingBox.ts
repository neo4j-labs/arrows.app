import {Point} from "@neo4j-arrows/model";
import { Vector } from "@neo4j-arrows/model";

export class BoundingBox {
  constructor(readonly left:number, readonly right:number, readonly top:number, readonly bottom:number) {  }

  get width() {
    return this.right - this.left
  }

  get height() {
    return this.bottom - this.top
  }

  corners() {
    return [
      new Point(this.left, this.top),
      new Point(this.right, this.top),
      new Point(this.left, this.bottom),
      new Point(this.right, this.bottom)
    ]
  }

  combine(other:BoundingBox) {
    return new BoundingBox(
      Math.min(this.left, other.left),
      Math.max(this.right, other.right),
      Math.min(this.top, other.top),
      Math.max(this.bottom, other.bottom)
    )
  }

  scale(scaleFactor:number) {
    return new BoundingBox(
      this.left * scaleFactor,
      this.right * scaleFactor,
      this.top * scaleFactor,
      this.bottom * scaleFactor
    )
  }

  translate(vector:Vector) {
    return new BoundingBox(
      this.left + vector.dx,
      this.right + vector.dx,
      this.top + vector.dy,
      this.bottom + vector.dy
    )
  }

  contains(point:Point) {
    return (
      point.x >= this.left && point.x <= this.right &&
      point.y >= this.top && point.y <= this.bottom
    )
  }

  containsBoundingBox(other:BoundingBox) {
    return (
      this.left <= other.left && this.right >= other.right &&
      this.top <= other.top && this.bottom >= other.bottom
    )
  }
}

/** 
 * A special bounding box which will always defer to any other legitimate bounding box under `combine()`
 * 
 * ABK: 
 * - obviate this
 */
export const AntiBoundingBox = new BoundingBox(Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE)
  
/**
 * ABK:
 * - this needs a test
 * - this does not work on an empty array, returning the AntiBoundingBox
 */
export const combineBoundingBoxes = (boundingBoxes:BoundingBox[]) => {
  // return boundingBoxes.reduce((accumulator, value) => (accumulator !== null) ? accumulator.combine(value) : value, null as BoundingBox | null)
  return boundingBoxes.reduce((accumulator, value) => accumulator.combine(value), AntiBoundingBox) 
}

export const boundingBoxOfPoints = (points:Point[]) => {
  const xCoordinates = points.map(point => point.x)
  const yCoordinates = points.map(point => point.y)
  return new BoundingBox(
    Math.min(...xCoordinates),
    Math.max(...xCoordinates),
    Math.min(...yCoordinates),
    Math.max(...yCoordinates)
  )
}