import {StyleFunction, white} from "@neo4j-arrows/model";
import memoize from "memoizee";

export const adaptForBackground = (color:string, style:StyleFunction) => {
  const backgroundColor = style('background-color') as string
  return adapt(color, backgroundColor)
}

const adapt = (() => {
  const factory = (colorString:string, backgroundColorString:string) => {
    const color = parse(colorString)
    const distanceFromWhite = color.distance(parse(white))
    const vectorFromWhite = color.minus(parse(white))
    const backgroundColor = parse(backgroundColorString)
    const primary = backgroundColor.plus(vectorFromWhite).normalise()
    const secondary = backgroundColor.plus(vectorFromWhite.scale(0.5)).normalise()
    const bestColor = Math.abs(distanceFromWhite - primary.distance(backgroundColor)) <
    Math.abs(distanceFromWhite - secondary.distance(backgroundColor)) ? primary : secondary
    return bestColor.toString()
  }
  return memoize(factory, { max: 100 })
})()

const parse = (colorString:string) => new ColorVector(components(colorString))

const components = (colorString:string) => [1, 3, 5].map(index =>
  Number.parseInt(colorString.substring(index, index + 2), 16))

class ColorVector {
  constructor(readonly components:number[]) {
    this.components = components
  }

  minus(that:ColorVector) {
    return new ColorVector(this.components.map((component, i) => component - that.components[i]))
  }

  plus(that:ColorVector) {
    return new ColorVector(this.components.map((component, i) => component + that.components[i]))
  }

  distance(that:ColorVector) {
    return this.components
      .map((component, i) => Math.abs(component - that.components[i]))
      .reduce((a, b) => a + b, 0)
  }

  scale(factor:number) {
    return new ColorVector(this.components.map((component) => component * factor))
  }

  normalise() {
    return new ColorVector(this.components.map((component) => {
      let value = Math.floor(component)
      while (value < 0) {
        value += 256
      }
      while (value > 255) {
        value -= 256
      }
      return value
    }))
  }

  toString() {
    return '#' + this.components.map(c => {
      const hex = Math.abs(c).toString(16)
      return hex.length > 1 ? hex : '0' + hex
    }).join('')
  }
}