import React, {Component} from 'react';
import {CaptionEditor} from "./CaptionEditor";
import {RelationshipTypeEditor} from "./RelationshipTypeEditor";
import {PropertiesEditor} from "./PropertiesEditor";
import {LabelsEditor} from "./LabelsEditor";

export class GraphTextEditors extends Component {

  constructor(props) {
    super(props)
  }

  entityEditor(entity) {
    switch (entity.entityType) {
      case 'node':
        const visualNode = this.props.visualGraph.nodes[entity.id]
        return (
          <div style={{
            transform: visualNode.position.vectorFromOrigin().asCSSTransform()
          }}>
            <div style={{
              transform: `scale(${visualNode.internalScaleFactor}) translate(0, ${visualNode.internalVerticalOffset}px)`
            }}>
              {visualNode.insideComponents.map(component => this.componentEditor(visualNode, component))}
            </div>
            {visualNode.outsideComponents.map(component => this.componentEditor(visualNode, component))}
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
          return (
            <RelationshipTypeEditor
              visualRelationship={visualRelationship}
              onSetRelationshipType={(type) => this.props.onSetRelationshipType(this.props.selection, type)}
            />
          )
        }
        break
    }
    return null
  }

  componentEditor(visualNode, component) {
    switch (component.type) {
      case 'CAPTION':
        return (
          <CaptionEditor
            key={'caption-' + visualNode.id}
            visualNode={visualNode}
            onSetNodeCaption={(caption) => this.props.onSetNodeCaption(this.props.selection, caption)}
          />
        )
      case 'LABELS':
        return (
          <LabelsEditor
            key={'labels-' + visualNode.id}
            visualNode={visualNode}
            selection={this.props.selection}
            onAddLabel={this.props.onAddLabel}
            onRenameLabel={this.props.onRenameLabel}
          />
        )
      case 'PROPERTIES':
        return (
          <PropertiesEditor
            key={'properties-' + visualNode.id}
            visualNode={visualNode}
            selection={this.props.selection}
            onSetPropertyKey={this.props.onSetPropertyKey}
            onSetPropertyValue={this.props.onSetPropertyValue}
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
}