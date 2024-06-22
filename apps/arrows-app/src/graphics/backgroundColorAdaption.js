import { white } from '../model/colors';
import memoize from 'memoizee';

export const adaptForBackground = (color, style) => {
  const backgroundColor = style('background-color');
  return adapt(color, backgroundColor);
};

const adapt = (() => {
  const factory = (colorString, backgroundColorString) => {
    const color = parse(colorString);
    const distanceFromWhite = color.distance(parse(white));
    const vectorFromWhite = color.minus(parse(white));
    const backgroundColor = parse(backgroundColorString);
    const primary = backgroundColor.plus(vectorFromWhite).normalise();
    const secondary = backgroundColor
      .plus(vectorFromWhite.scale(0.5))
      .normalise();
    const bestColor =
      Math.abs(distanceFromWhite - primary.distance(backgroundColor)) <
      Math.abs(distanceFromWhite - secondary.distance(backgroundColor))
        ? primary
        : secondary;
    return bestColor.toString();
  };
  return memoize(factory, { max: 100 });
})();

const parse = (colorString) => new ColorVector(components(colorString));

const components = (colorString) =>
  [1, 3, 5].map((index) =>
    Number.parseInt(colorString.substring(index, index + 2), 16)
  );

class ColorVector {
  constructor(components) {
    this.components = components;
  }

  minus(that) {
    return new ColorVector(
      this.components.map((component, i) => component - that.components[i])
    );
  }

  plus(that) {
    return new ColorVector(
      this.components.map((component, i) => component + that.components[i])
    );
  }

  distance(that) {
    return this.components
      .map((component, i) => Math.abs(component - that.components[i]))
      .reduce((a, b) => a + b, 0);
  }

  scale(factor) {
    return new ColorVector(
      this.components.map((component) => component * factor)
    );
  }

  normalise() {
    return new ColorVector(
      this.components.map((component) => {
        let value = Math.floor(component);
        while (value < 0) {
          value += 256;
        }
        while (value > 255) {
          value -= 256;
        }
        return value;
      })
    );
  }

  toString() {
    return (
      '#' +
      this.components
        .map((c) => {
          const hex = Math.abs(c).toString(16);
          return hex.length > 1 ? hex : '0' + hex;
        })
        .join('')
    );
  }
}
