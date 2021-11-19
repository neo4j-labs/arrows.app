import {white} from "../model/colors";
import memoize from "memoizee";

export const adaptForBackground = (color, style) => {
  const backgroundColor = style('background-color')
  return adapt(color, backgroundColor)
}

const adapt = (() => {
  const factory = (color, backgroundColor) => {
    const colorFromWhite = parse(color).minus(parse(white))
    return parse(backgroundColor).plus(colorFromWhite).toString()
  }
  return memoize(factory, { max: 100 })
})()

const parse = (colorString) => new ColorVector(components(colorString))

const components = (colorString) => [1, 3, 5].map(index =>
  Number.parseInt(colorString.substring(index, index + 2), 16))

class ColorVector {
  constructor(components) {
    this.components = components
  }

  minus(that) {
    return new ColorVector(this.components.map((component, i) => {
      let value = component - that.components[i]
      while (value < 0) {
        value += 256
      }
      return value
    }))
  }

  plus(that) {
    return new ColorVector(this.components.map((component, i) => (component + that.components[i]) % 256))
  }

  toString() {
    return '#' + this.components.map(c => {
      const hex = Math.abs(c).toString(16)
      return hex.length > 1 ? hex : '0' + hex
    }).join('')
  }
}