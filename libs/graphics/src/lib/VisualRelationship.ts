// import {getStyleSelector} from "../selectors/style";
import { Graph, Point, getStyleSelector } from '@neo4j-arrows/model';
import { RelationshipType } from './RelationshipType';
import { PropertiesOutside } from './PropertiesOutside';
import { IconOutside } from './IconOutside';
import { Vector } from '@neo4j-arrows/model';
import {
  alignmentForShaftAngle,
  readableAngle,
} from './relationshipTextAlignment';
import { boundingBoxOfPoints } from './utils/BoundingBox';
import { ComponentStack } from './ComponentStack';
import { ResolvedRelationship } from './ResolvedRelationship';
import { ImageInfo } from './utils/ImageCache';
import { TextMeasurementContext } from './utils/TextMeasurementContext';
import { AnyArrow } from './AnyArrow';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { TextOrientation } from './circumferentialTextAlignment';
import { DrawingContext } from './utils/DrawingContext';

export class VisualRelationship {
  resolvedRelationship: ResolvedRelationship;
  arrow: AnyArrow;
  editing: boolean;
  componentRotation: number;
  components: ComponentStack;
  icon?: IconOutside;
  type?: RelationshipType;
  properties?: PropertiesOutside;
  componentOffset: Vector;
  constructor(
    resolvedRelationship: ResolvedRelationship,
    graph: Graph,
    arrow: AnyArrow,
    editing: boolean,
    measureTextContext: TextMeasurementContext,
    imageCache: Record<string, ImageInfo>
  ) {
    this.resolvedRelationship = resolvedRelationship;
    this.arrow = arrow;
    this.editing = editing;

    const style = (styleAttribute: string) =>
      getStyleSelector(
        resolvedRelationship.relationship,
        styleAttribute
      )(graph);

    const orientationName = style('detail-orientation');
    const positionName = style('detail-position');
    this.componentRotation = readableAngle(orientationName, arrow.shaftAngle());
    const alignment = alignmentForShaftAngle(
      orientationName,
      positionName,
      arrow.shaftAngle()
    );

    this.components = new ComponentStack();
    const iconImage = style('relationship-icon-image');
    const hasIcon = !!iconImage;
    const hasType = !!resolvedRelationship.type;
    const hasProperties =
      Object.keys(resolvedRelationship.relationship.properties).length > 0;

    if (hasIcon) {
      this.components.push(
        (this.icon = new IconOutside(
          'relationship-icon-image',
          alignment,
          editing,
          style,
          imageCache
        ))
      );
    }
    if (hasType) {
      this.components.push(
        (this.type = new RelationshipType(
          resolvedRelationship.type,
          alignment,
          editing,
          style,
          measureTextContext
        ))
      );
    }
    if (hasProperties) {
      this.components.push(
        (this.properties = new PropertiesOutside(
          resolvedRelationship.relationship.properties,
          alignment,
          editing,
          style,
          measureTextContext
        ))
      );
    }

    const width = this.components.maxWidth();
    const height = this.components.totalHeight();
    const margin = arrow.dimensions.arrowWidth;

    switch (orientationName) {
      case 'horizontal':
        // const shaftAngle = arrow.shaftAngle()
        this.componentOffset = horizontalOffset(
          width,
          height,
          margin,
          alignment,
          arrow.shaftAngle()
        );
        break;

      case 'parallel':
        this.componentOffset = parallelOffset(height, margin, positionName);
        break;

      case 'perpendicular':
        this.componentOffset = perpendicularOffset(height, margin, alignment);
        break;
      default:
        this.componentOffset = perpendicularOffset(height, margin, alignment);
    }
  }

  get id() {
    return this.resolvedRelationship.id;
  }

  boundingBox() {
    const midPoint = this.arrow.midPoint();

    if (this.components.isEmpty()) {
      return boundingBoxOfPoints([midPoint]);
    }

    const points = this.components.boundingBox().corners();
    const transformedPoints = points.map((point) =>
      point
        .translate(this.componentOffset)
        .rotate(this.componentRotation)
        .translate(midPoint.vectorFromOrigin())
    );

    return boundingBoxOfPoints([midPoint, ...transformedPoints]);
  }

  distanceFrom(point: Point) {
    const localPoint = point.translate(
      this.arrow.midPoint().vectorFromOrigin().invert()
    );
    const componentPoint = localPoint
      .rotate(-this.componentRotation)
      .translate(this.componentOffset.invert());
    return Math.min(
      this.arrow.distanceFrom(point),
      this.components.distanceFrom(componentPoint)
    );
  }

  draw(ctx: DrawingContext) {
    if (
      this.resolvedRelationship.from.status === 'combined' &&
      this.resolvedRelationship.to.status === 'combined' &&
      this.resolvedRelationship.from.superNodeId ===
        this.resolvedRelationship.to.superNodeId
    ) {
      return;
    }

    // ctx.save('relationship') // ABK: ?
    ctx.save();

    if (this.resolvedRelationship.selected) {
      this.arrow.drawSelectionIndicator(ctx);

      ctx.save();
      ctx.translate(...this.arrow.midPoint().xy);
      ctx.rotate(this.componentRotation);
      ctx.translate(...this.componentOffset.dxdy);

      this.components.drawSelectionIndicator(ctx);

      ctx.restore();
    }
    this.arrow.draw(ctx);

    ctx.save();
    ctx.translate(...this.arrow.midPoint().xy);
    ctx.rotate(this.componentRotation);
    ctx.translate(...this.componentOffset.dxdy);

    this.components.draw(ctx);

    ctx.restore();
    ctx.restore();
  }
}

const horizontalOffset = (
  width: number,
  height: number,
  margin: number,
  alignment: TextOrientation,
  shaftAngle: number
) => {
  if (alignment.horizontal === 'center' && alignment.vertical === 'center') {
    return new Vector(0, -height / 2);
  }

  const positiveAngle = shaftAngle < 0 ? shaftAngle + Math.PI : shaftAngle;
  const mx = margin * Math.sin(positiveAngle);
  const my = margin * Math.abs(Math.cos(positiveAngle));

  // let dx, dy

  const dx = (() => {
    switch (alignment.horizontal) {
      case 'start':
        return mx;

      case 'center':
        return width / 2;

      default:
        return -mx;
    }
  })();
  const dy = (() => {
    switch (alignment.vertical) {
      case 'top':
        return my;

      case 'center':
        return -(height + my);

      default:
        return -(height + my);
    }
  })();

  const d =
    ((alignment.horizontal === 'end' ? 1 : -1) * width * Math.cos(shaftAngle) +
      (alignment.vertical === 'top' ? -1 : 1) * height * Math.sin(shaftAngle)) /
    2;

  return new Vector(dx, dy).plus(new Vector(d, 0).rotate(shaftAngle));
};

const parallelOffset = (
  height: number,
  margin: number,
  positionName: 'above' | 'inline' | 'below'
) => {
  const verticalPosition = (() => {
    switch (positionName) {
      case 'above':
        return -(height + margin);
      case 'inline':
        return -height / 2;
      case 'below':
        return margin;
    }
  })();
  return new Vector(0, verticalPosition);
};

const perpendicularOffset = (
  height: number,
  margin: number,
  alignment: TextOrientation
) => {
  const horizontalPosition = (() => {
    switch (alignment.horizontal) {
      case 'start':
        return margin;

      case 'end':
        return -margin;

      default:
        return 0;
    }
  })();
  return new Vector(horizontalPosition, -height / 2);
};
