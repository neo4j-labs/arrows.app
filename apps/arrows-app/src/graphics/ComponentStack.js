import { Vector } from '../model/Vector';
import { combineBoundingBoxes } from './utils/BoundingBox';

export class ComponentStack {
  constructor() {
    this.offsetComponents = [];
  }

  push(component) {
    let top = 0;
    if (!this.isEmpty()) {
      const above = this.bottomComponent();
      const safeMargin = (component) => component.margin || 0;
      const margin = Math.max(
        safeMargin(above.component),
        safeMargin(component)
      );
      top = above.top + above.component.height + margin;
    }
    this.offsetComponents.push({ component, top });
  }

  isEmpty(filter) {
    return (
      (filter ? this.offsetComponents.filter(filter) : this.offsetComponents)
        .length === 0
    );
  }

  bottomComponent() {
    return this.offsetComponents[this.offsetComponents.length - 1];
  }

  totalHeight() {
    if (this.isEmpty()) {
      return 0;
    }
    const bottomComponent = this.bottomComponent();
    return bottomComponent.top + bottomComponent.component.height;
  }

  maxWidth() {
    return Math.max(
      ...this.offsetComponents.map(
        (offsetComponent) => offsetComponent.component.width
      )
    );
  }

  maxRadius(verticalOffset) {
    return this.offsetComponents.reduce((largest, offsetComponent) => {
      const component = offsetComponent.component;
      const topCorner = new Vector(component.width / 2, verticalOffset);
      const bottomCorner = new Vector(
        component.width / 2,
        verticalOffset + component.height
      );
      return Math.max(largest, topCorner.distance(), bottomCorner.distance());
    }, 0);
  }

  everythingFits(verticalOffset, radius) {
    return this.maxRadius(verticalOffset) <= radius;
  }

  scaleToFit(verticalOffset, radius) {
    const effectiveRadius = this.maxRadius(verticalOffset);
    return radius / effectiveRadius;
  }

  boundingBox() {
    return combineBoundingBoxes(
      this.offsetComponents.map((offsetComponent) =>
        offsetComponent.component
          .boundingBox()
          .translate(new Vector(0, offsetComponent.top))
      )
    );
  }

  distanceFrom(point) {
    return Math.min(
      ...this.offsetComponents.map((offsetComponent) => {
        const localPoint = point.translate(new Vector(0, -offsetComponent.top));
        return offsetComponent.component.distanceFrom(localPoint);
      })
    );
  }

  draw(ctx) {
    this.offsetComponents.forEach((offsetComponent) => {
      ctx.save();
      ctx.translate(0, offsetComponent.top);

      offsetComponent.component.draw(ctx);

      ctx.restore();
    });
  }

  drawSelectionIndicator(ctx) {
    this.offsetComponents.forEach((offsetComponent) => {
      ctx.save();
      ctx.translate(0, offsetComponent.top);

      offsetComponent.component.drawSelectionIndicator(ctx);

      ctx.restore();
    });
  }
}
