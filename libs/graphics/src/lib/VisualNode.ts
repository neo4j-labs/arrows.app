// import {getStyleSelector} from "../selectors/style";
import { getStyleSelector, Graph, Node, Point } from '@neo4j-arrows/model';
import { NodeLabelsOutsideNode } from './NodeLabelsOutsideNode';
import { NodeCaptionInsideNode } from './NodeCaptionInsideNode';
import { NodeBackground } from './NodeBackground';
import { PropertiesOutside } from './PropertiesOutside';
import { neighbourPositions } from '@neo4j-arrows/model';
import { BoundingBox } from './utils/BoundingBox';
import { NodeCaptionOutsideNode } from './NodeCaptionOutsideNode';
import { NodePropertiesInside } from './NodePropertiesInside';
import { bisect } from './bisect';
import { NodeLabelsInsideNode } from './NodeLabelsInsideNode';
import { NodeCaptionFillNode } from './NodeCaptionFillNode';
import { NodeIconInside } from './NodeIconInside';
import { IconOutside } from './IconOutside';
import { distribute } from './circumferentialDistribution';
import {
  orientationAngles,
  orientationFromAngle,
  orientationFromName,
} from './circumferentialTextAlignment';
import { Vector } from '@neo4j-arrows/model';
import { ComponentStack } from './ComponentStack';
import { ImageInfo } from './utils/ImageCache';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { TextMeasurementContext } from './utils/TextMeasurementContext';
import { DrawingContext } from './utils/DrawingContext';

export class VisualNode {
  internalRadius: number;
  radius: number;
  outsideComponentRadius: number;
  fitRadius: number;
  background: NodeBackground;
  internalVerticalOffset: number;
  internalScaleFactor?: number;
  insideComponents: any;
  outsideComponents: any;
  outsideOrientation: import('/Users/akollegger/Developer/neo4j-contrib/neo4j-arrows-app/libs/graphics/src/lib/circumferentialTextAlignment').TextOrientation;
  icon?: NodeIconInside;
  caption?: NodeCaptionInsideNode | NodeCaptionFillNode;
  labels?: NodeLabelsInsideNode;
  properties?: NodePropertiesInside;
  outsideOffset: Vector;

  constructor(
    readonly node: Node,
    readonly graph: Graph,
    readonly selected: boolean,
    readonly editing: boolean,
    measureTextContext: TextMeasurementContext,
    imageCache: Record<string, ImageInfo>
  ) {
    const style = (styleAttribute: string) =>
      getStyleSelector(node, styleAttribute)(graph);

    this.internalRadius = style('radius') as number;
    this.radius = this.internalRadius + style('border-width');
    this.outsideComponentRadius = this.radius + style('node-margin');
    this.fitRadius = this.internalRadius - style('node-padding');
    this.background = new NodeBackground(
      node.position,
      this.internalRadius,
      editing,
      style,
      imageCache
    );
    const neighbourObstacles = neighbourPositions(node, graph).map(
      (position) => {
        return { angle: position.vectorFrom(node.position).angle() };
      }
    );

    this.internalVerticalOffset = 0;
    this.internalScaleFactor = undefined;
    this.insideComponents = new ComponentStack();
    this.outsideComponents = new ComponentStack();

    const captionPosition = style('caption-position');
    const labelPosition = style('label-position');
    const propertyPosition = style('property-position');
    const iconImage = style('node-icon-image');
    const iconPosition = style('icon-position');
    const hasIcon = !!iconImage;
    const hasCaption = !!node.caption;
    const hasLabels = node.ontologies && node.ontologies.length > 0;
    const hasProperties = Object.keys(node.properties).length > 0;

    const outsidePosition = style('outside-position');
    switch (outsidePosition) {
      case 'auto':
        this.outsideOrientation = orientationFromAngle(
          distribute(orientationAngles, neighbourObstacles)
        );
        break;

      default:
        this.outsideOrientation = orientationFromName(outsidePosition);
    }

    if (hasIcon) {
      switch (iconPosition) {
        case 'inside':
          this.insideComponents.push(
            (this.icon = new NodeIconInside(
              'node-icon-image',
              editing,
              style,
              imageCache
            ))
          );
          break;
        default:
          this.outsideComponents.push(
            (this.icon = new IconOutside(
              'node-icon-image',
              this.outsideOrientation,
              editing,
              style,
              imageCache
            ))
          );
      }
    }

    const caption = node.caption || '';
    if (hasCaption) {
      switch (captionPosition) {
        case 'inside':
          if (
            (hasLabels && labelPosition === 'inside') ||
            (hasProperties && propertyPosition === 'inside') ||
            (hasIcon && iconPosition === 'inside')
          ) {
            this.insideComponents.push(
              (this.caption = new NodeCaptionInsideNode(
                caption,
                editing,
                style,
                measureTextContext
              ))
            );
          } else {
            this.internalScaleFactor = bisect(
              (factor) => {
                this.caption = new NodeCaptionFillNode(
                  caption,
                  this.fitRadius / factor,
                  editing,
                  style,
                  measureTextContext
                );
                return this.caption.contentsFit;
              },
              1,
              1e-6
            );
            this.insideComponents.push(this.caption);
          }
          break;
        default:
          this.outsideComponents.push(
            (this.caption = new NodeCaptionOutsideNode(
              caption,
              this.outsideOrientation,
              editing,
              style,
              measureTextContext
            ))
          );
          break;
      }
    }

    if (hasLabels) {
      switch (labelPosition) {
        case 'inside':
          this.insideComponents.push(
            (this.labels = new NodeLabelsInsideNode(
              node.ontologies?.map((ontology) => ontology.id) ?? [],
              editing,
              style,
              measureTextContext
            ))
          );
          break;

        default:
          this.outsideComponents.push(
            (this.labels = new NodeLabelsOutsideNode(
              node.ontologies?.map((ontology) => ontology.id) ?? [],
              this.outsideOrientation,
              editing,
              style,
              measureTextContext
            ))
          );
      }
    }

    if (hasProperties) {
      switch (propertyPosition) {
        case 'inside':
          this.insideComponents.push(
            (this.properties = new NodePropertiesInside(
              node.properties,
              editing,
              style,
              measureTextContext
            ))
          );
          break;

        default:
          this.outsideComponents.push(
            (this.properties = new PropertiesOutside(
              node.properties,
              this.outsideOrientation,
              editing,
              style,
              measureTextContext
            ))
          );
      }
    }

    if (this.internalScaleFactor === undefined) {
      this.internalVerticalOffset = -this.insideComponents.totalHeight() / 2;
      this.internalScaleFactor = this.insideComponents.everythingFits(
        this.internalVerticalOffset,
        this.fitRadius
      )
        ? 1
        : this.insideComponents.scaleToFit(
            this.internalVerticalOffset,
            this.fitRadius
          );
    }

    const outsideVerticalOffset = (() => {
      const height = this.outsideComponents.totalHeight();
      switch (this.outsideOrientation.vertical) {
        case 'top':
          return -height;
        case 'center':
          return -height / 2;
        case 'bottom':
          return 0;
      }
    })();
    this.outsideOffset = new Vector(1, 0)
      .rotate(this.outsideOrientation.angle || 0)
      .scale(this.outsideComponentRadius)
      .plus(new Vector(0, outsideVerticalOffset));
  }

  get id() {
    return this.node.id;
  }

  get position() {
    return this.node.position;
  }

  get status() {
    return this.node.status;
  }

  get superNodeId() {
    return this.node.superNodeId;
  }

  get type() {
    return this.node.type;
  }

  get initialPositions() {
    return this.node.initialPositions;
  }

  draw(ctx: DrawingContext) {
    if (this.status === 'combined') {
      return;
    }

    // ctx.save('node') // ABK reconcile "named" save as used by `SvgAdaptor` and un-named save of `CanvasAdaptor`
    ctx.save();

    if (this.selected) {
      this.background.drawSelectionIndicator(ctx);

      ctx.save();
      ctx.translate(...this.position.xy);
      ctx.translate(...this.outsideOffset.dxdy);

      this.outsideComponents.drawSelectionIndicator(ctx);

      ctx.restore();
    }

    this.background.draw(ctx);

    ctx.save();
    ctx.translate(...this.position.xy);

    ctx.save();
    ctx.scale(this.internalScaleFactor || 1.0);
    ctx.translate(0, this.internalVerticalOffset);

    this.insideComponents.draw(ctx);

    ctx.restore();

    ctx.save();
    ctx.translate(...this.outsideOffset.dxdy);

    this.outsideComponents.draw(ctx);

    ctx.restore();

    ctx.restore();
    ctx.restore();
  }

  boundingBox() {
    const box = new BoundingBox(
      this.position.x - this.radius,
      this.position.x + this.radius,
      this.position.y - this.radius,
      this.position.y + this.radius
    );

    if (this.outsideComponents.isEmpty()) {
      return box;
    }

    return box.combine(
      this.outsideComponents
        .boundingBox()
        .translate(this.position.vectorFromOrigin())
        .translate(this.outsideOffset)
    );
  }

  distanceFrom(point: Point) {
    const localPoint = point.translate(
      this.position.vectorFromOrigin().invert()
    );
    const outsidePoint = localPoint.translate(this.outsideOffset.invert());
    return Math.min(
      this.position.vectorFrom(point).distance(),
      this.outsideComponents.distanceFrom(outsidePoint)
    );
  }
}
