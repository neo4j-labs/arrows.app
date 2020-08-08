import {getStyleSelector} from "../selectors/style";
import {RelationshipType} from "./RelationshipType";
import {PropertiesOutside} from "./PropertiesOutside";
import {maxWidth, totalHeight} from "./componentStackGeometry";
import {Vector} from "../model/Vector";
import {alignmentForShaftAngle, readableAngle} from "./relationshipTextAlignment";

export class VisualRelationship {
  constructor(resolvedRelationship, graph, arrow, editing, measureTextContext) {
    this.resolvedRelationship = resolvedRelationship
    this.arrow = arrow
    this.editing = editing

    const style = styleAttribute => getStyleSelector(resolvedRelationship.relationship, styleAttribute)(graph)

    const orientationName = style('detail-orientation');
    const positionName = style('detail-position')
    this.componentRotation = readableAngle(orientationName, arrow.shaftAngle())
    const alignment = alignmentForShaftAngle(orientationName, positionName, arrow.shaftAngle())

    this.components = []
    const hasType = !!resolvedRelationship.type
    const hasProperties = Object.keys(resolvedRelationship.relationship.properties).length > 0

    if (hasType) {
      this.components.push(this.type = new RelationshipType(
        resolvedRelationship.type, alignment, editing, style, measureTextContext))
    }
    if (hasProperties) {
      this.components.push(this.properties = new PropertiesOutside(
        resolvedRelationship.relationship.properties, alignment, totalHeight(this.components), editing, style, measureTextContext))
    }

    const width = maxWidth(this.components)
    const height = totalHeight(this.components)
    const margin = arrow.dimensions.arrowWidth

    switch (orientationName) {
      case 'horizontal':
        const shaftAngle = arrow.shaftAngle()
        this.componentOffset = computeOffset(width, height, margin, alignment, shaftAngle)
        break

      default:
        const verticalPosition = (() => {
          switch (positionName) {
            case 'above':
              return -(height + margin)
            case 'inline':
              return -height / 2
            case 'below':
              return margin
          }
        })()
        this.componentOffset = new Vector(0, verticalPosition)
    }
  }

  get id() {
    return this.resolvedRelationship.id
  }

  distanceFrom(point) {
    const componentPoint = point.translate(this.componentOffset.invert())
    return Math.min(
      this.arrow.distanceFrom(point),
      ...this.components.map(component => component.distanceFrom(componentPoint))
    )
  }

  draw(ctx) {
    if (this.resolvedRelationship.from.status === 'combined' && this.resolvedRelationship.to.status === 'combined'
      && this.resolvedRelationship.from.superNodeId === this.resolvedRelationship.to.superNodeId) {
      return
    }

    if (this.resolvedRelationship.selected) {
      this.arrow.drawSelectionIndicator(ctx)

      ctx.save()
      ctx.translate(...this.arrow.midPoint().xy)
      ctx.rotate(this.componentRotation)
      ctx.translate(...this.componentOffset.dxdy)

      this.components.forEach(component => {
        component.drawSelectionIndicator(ctx)
      })

      ctx.restore()
    }
    this.arrow.draw(ctx)

    ctx.save()
    ctx.translate(...this.arrow.midPoint().xy)
    ctx.rotate(this.componentRotation)
    ctx.translate(...this.componentOffset.dxdy)

    this.components.forEach(component => {
      component.draw(ctx)
    })

    ctx.restore()
  }
}

const computeOffset = (width, height, margin, alignment, shaftAngle) => {
  if (alignment.horizontal === 'center' && alignment.vertical === 'center') {
    return new Vector(0, -height / 2)
  }

  const positiveAngle = shaftAngle < 0 ? shaftAngle + Math.PI : shaftAngle
  const mx = margin * Math.sin(positiveAngle)
  const my = margin * Math.abs(Math.cos(positiveAngle))

  let dx, dy

  dx = (() => {
    switch (alignment.horizontal) {
      case 'start':
        return mx

      case 'center':
        return width / 2

      default:
        return -mx
    }
  })()
  dy = (() => {
    switch (alignment.vertical) {
      case 'top':
        return my

      case 'center':
        return -(height + my)

      default:
        return -(height + my)
    }
  })()

  const d = ((alignment.horizontal === 'end' ? 1 : -1) * width * Math.cos(shaftAngle)
    + (alignment.vertical === 'top' ? -1 : 1) * height * Math.sin(shaftAngle)) / 2

  return new Vector(dx, dy).plus(new Vector(d, 0).rotate(shaftAngle))
}