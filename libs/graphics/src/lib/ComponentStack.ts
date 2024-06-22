import { Point, Vector } from '@neo4j-arrows/model';
import { combineBoundingBoxes } from './utils/BoundingBox';
import { DrawableComponent } from './DrawableComponent';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export interface StackedComponent {
  component: DrawableComponent;
  top: number;
}

export class ComponentStack {
  offsetComponents: StackedComponent[];

  constructor() {
    this.offsetComponents = [];
  }

  push(component: DrawableComponent) {
    let top = 0;
    if (!this.isEmpty()) {
      const above = this.bottomComponent();
      const safeMargin = (component: DrawableComponent) =>
        component.margin || 0;
      const margin = Math.max(
        safeMargin(above.component),
        safeMargin(component)
      );
      top = above.top + above.component.height + margin;
    }
    this.offsetComponents.push({ component, top });
  }

  isEmpty(filter?: (sc: StackedComponent) => boolean) {
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

  maxRadius(verticalOffset: number) {
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

  everythingFits(verticalOffset: number, radius: number) {
    return this.maxRadius(verticalOffset) <= radius;
  }

  scaleToFit(verticalOffset: number, radius: number) {
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

  distanceFrom(point: Point) {
    return Math.min(
      ...this.offsetComponents.map((offsetComponent) => {
        const localPoint = point.translate(new Vector(0, -offsetComponent.top));
        return offsetComponent.component.distanceFrom(localPoint);
      })
    );
  }

  draw(ctx: DrawingContext) {
    this.offsetComponents.forEach((offsetComponent) => {
      ctx.save();
      ctx.translate(0, offsetComponent.top);

      offsetComponent.component.draw(ctx);

      ctx.restore();
    });
  }

  drawSelectionIndicator(ctx: DrawingContext) {
    this.offsetComponents.forEach((offsetComponent) => {
      ctx.save();
      ctx.translate(0, offsetComponent.top);

      offsetComponent.component.drawSelectionIndicator?.(ctx);

      ctx.restore();
    });
  }
}
