import {Vector} from "../model/Vector";

export const totalHeight = (components) => components.reduce((sum, component) => sum + component.height, 0)

const maxRadius = (insideComponents, verticalOffset) => {
  return insideComponents.reduce((largest, component) => {
    const topCorner = new Vector(component.width / 2, verticalOffset)
    const bottomCorner = new Vector(component.width / 2, verticalOffset + component.height)
    return Math.max(largest, topCorner.distance(), bottomCorner.distance())
  }, 0)
}

export const everythingFits = (insideComponents, verticalOffset, radius) => {
  return maxRadius(insideComponents, verticalOffset) <= radius
}

export const scaleToFit = (insideComponents, verticalOffset, radius) => {
  const effectiveRadius = maxRadius(insideComponents, verticalOffset)
  return radius / effectiveRadius
}
