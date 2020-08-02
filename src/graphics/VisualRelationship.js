import {getStyleSelector} from "../selectors/style";
import {RelationshipType} from "./RelationshipType";
import {PropertiesOutside} from "./PropertiesOutside";
import {orientationFromName} from "./circumferentialTextAlignment";
import {totalHeight} from "./componentStackGeometry";
import {Vector} from "../model/Vector";

export class VisualRelationship {
  constructor(resolvedRelationship, graph, arrow, editing, measureTextContext) {
    this.resolvedRelationship = resolvedRelationship
    this.arrow = arrow
    this.editing = editing

    const style = styleAttribute => getStyleSelector(resolvedRelationship.relationship, styleAttribute)(graph)

    const orientation = orientationFromName('dead-center')
    this.components = []
    const hasType = !!resolvedRelationship.type
    const hasProperties = Object.keys(resolvedRelationship.relationship.properties).length > 0

    if (hasType) {
      this.components.push(this.type = new RelationshipType(
        resolvedRelationship.type, orientation, editing, style, measureTextContext))
    }
    if (hasProperties) {
      this.components.push(this.properties = new PropertiesOutside(
        resolvedRelationship.relationship.properties, orientation, totalHeight(this.components), editing, style, measureTextContext))
    }

    this.componentOffset = new Vector(0, -totalHeight(this.components) / 2)
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
      ctx.translate(...this.componentOffset.dxdy)

      this.components.forEach(component => {
        component.drawSelectionIndicator(ctx)
      })

      ctx.restore()
    }
    this.arrow.draw(ctx)

    ctx.save()
    ctx.translate(...this.arrow.midPoint().xy)
    ctx.translate(...this.componentOffset.dxdy)

    this.components.forEach(component => {
      component.draw(ctx)
    })

    ctx.restore()
  }
}

const computeOffset = (width, height, alignment, angle) => {
  let dx, dy

  dx = alignment.horizontal === 'right' ? -width : 0
  dy = alignment.vertical === 'top' ? -height : 0

  const d = ((alignment.horizontal === 'right'? 1 : -1) * (width * Math.cos(angle))
    + (alignment.vertical === 'top'? 1 : -1) * (height * Math.sin(angle))) / 2
  return new Vector(dx, dy).plus(new Vector(d, 0).rotate(angle))
}