import {getStyleSelector} from "../selectors/style";
import {RelationshipType} from "./RelationshipType";
import {PropertiesOutside} from "./PropertiesOutside";
import {orientationFromName} from "./circumferentialTextAlignment";
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
    const verticalPosition = (() => {
      switch (positionName) {
        case 'above':
          return -height
        case 'inline':
          return -height / 2
        case 'below':
          return 0
      }
    })()
    // this.componentOffset = new Vector(0, -height).plus(computeOffset(width, height, alignment, arrow.shaftAngle()))
    this.componentOffset = new Vector(0, verticalPosition)
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

const computeOffset = (width, height, alignment, angle) => {
  // if (alignment.horizontal === 'center' || alignment.vertical === 'center') {
  //   return new Vector(0,0)
  // }

  // let dx, dy
  //
  // dx = alignment.horizontal === 'end' ? -width : 0
  // dx = 0
  // dy = alignment.vertical === 'top' ? -height : 0

  const choose = (key, a, b, c) => {

  }
  const d = ((alignment.horizontal === 'end'? 1 : -1) * (width * Math.cos(angle))
    + (alignment.vertical === 'top'? -1 : 1) * (height * Math.sin(angle))) / 2
  return new Vector(d, 0).rotate(angle)
  // return new Vector(dx, dy).plus(new Vector(d, 0).rotate(angle))
}