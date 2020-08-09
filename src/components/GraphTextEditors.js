import React, {Component} from 'react';
import {CaptionEditor} from "./CaptionEditor";
import {RelationshipTypeEditor} from "./RelationshipTypeEditor";
import {PropertiesEditor} from "./PropertiesEditor";
import {LabelsEditor} from "./LabelsEditor";
import {getStyleSelector} from "../selectors/style";
import {NodeCaptionFillNode} from "../graphics/NodeCaptionFillNode";
import {NodeCaptionOutsideNode} from "../graphics/NodeCaptionOutsideNode";
import {measureTextContext} from "../selectors";
import {RelationshipType} from "../graphics/RelationshipType";

export class GraphTextEditors extends Component {

  constructor(props) {
    super(props)
  }

  entityEditor(entity) {
    switch (entity.entityType) {
      case 'node':
        const visualNode = this.props.visualGraph.nodes[entity.id]
        let insideComponents = visualNode.insideComponents
        let outsideComponents = visualNode.outsideComponents
        if (insideComponents.length === 0 && outsideComponents.length === 0) {
          const style = styleAttribute => getStyleSelector(visualNode.node, styleAttribute)(this.props.visualGraph.graph)
          const captionPosition = style( 'caption-position')
          switch (captionPosition) {
            case 'inside':
              const insideCaption = new NodeCaptionFillNode(
                '', visualNode.radius, 'true', style, measureTextContext)
              insideComponents = [insideCaption]
              break
            default:
              const outsideCaption = new NodeCaptionOutsideNode(
                '', visualNode.outsideOrientation, true, style, measureTextContext)
              outsideComponents = [outsideCaption]
              break
          }

        }
        return (
          <div style={{
            transform: visualNode.position.vectorFromOrigin().asCSSTransform()
          }}>
            <div style={{
              transform: `scale(${visualNode.internalScaleFactor}) translate(0, ${visualNode.internalVerticalOffset}px)`
            }}>
              {insideComponents.map(component => this.componentEditor(visualNode, component))}
            </div>
            <div style={{
              transform: visualNode.outsideOffset.asCSSTransform()
            }}>
              {outsideComponents.map(component => this.componentEditor(visualNode, component))}
            </div>
          </div>
        )

      case 'relationship':
        let visualRelationship = null
        this.props.visualGraph.relationshipBundles.forEach(relationshipBundle => {
          relationshipBundle.routedRelationships.forEach(candidateRelationship => {
            if (candidateRelationship.id === entity.id) {
              visualRelationship = candidateRelationship
            }
          })
        })
        if (visualRelationship) {
          let components = visualRelationship.components
          if (components.length === 0) {
            const style = styleAttribute => getStyleSelector(visualRelationship.resolvedRelationship.relationship, styleAttribute)(this.props.visualGraph.graph)
            const type = new RelationshipType(
              '', {horizontal: 'center', vertical: 'center'}, true, style, measureTextContext)
            components = [type]
          }
          return (
            <div style={{
              transform: [
                visualRelationship.arrow.midPoint().vectorFromOrigin().asCSSTransform(),
                `rotate(${visualRelationship.componentRotation}rad)`,
                visualRelationship.componentOffset.asCSSTransform()
              ].join(' ')
            }}>
              {components.map(component => this.componentEditor(visualRelationship, component))}
            </div>
          )
        }
        break
    }
    return null
  }

  componentEditor(visualEntity, component) {
    switch (component.type) {
      case 'CAPTION':
        return (
          <CaptionEditor
            key={'caption-' + visualEntity.id}
            visualNode={visualEntity}
            component={component}
            onSetNodeCaption={(caption) => this.props.onSetNodeCaption(this.props.selection, caption)}
            onKeyDown={this.handleKeyDown}
          />
        )
      case 'LABELS':
        return (
          <LabelsEditor
            key={'labels-' + visualEntity.id}
            visualNode={visualEntity}
            selection={this.props.selection}
            onAddLabel={this.props.onAddLabel}
            onRenameLabel={this.props.onRenameLabel}
            onKeyDown={this.handleKeyDown}
          />
        )
      case 'TYPE':
        return (
          <RelationshipTypeEditor
            visualRelationship={visualEntity}
            component={component}
            onSetRelationshipType={(type) => this.props.onSetRelationshipType(this.props.selection, type)}
            onKeyDown={this.handleKeyDown}
          />
        )
      case 'PROPERTIES':
        return (
          <PropertiesEditor
            key={'properties-' + visualEntity.id}
            visualNode={visualEntity}
            selection={this.props.selection}
            onSetPropertyKey={this.props.onSetPropertyKey}
            onSetPropertyValue={this.props.onSetPropertyValue}
            onKeyDown={this.handleKeyDown}
          />
        )
    }
  }

  render() {
    const entity = this.props.selection.editing
    if (entity) {
      return (
        <div style={{
          transform: this.props.viewTransformation.asCSSTransform(),
          position: 'absolute',
          left: 0,
          top: 0
        }}>
          {this.entityEditor(entity)}
        </div>
      )
    } else {
      return null
    }
  }

  handleKeyDown = (e) => {
    if (e.key === 'Escape' || (e.key === 'Enter' && e.metaKey)) {
      this.props.onExit()
    }
  }
}