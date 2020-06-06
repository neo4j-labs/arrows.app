import React, {Component} from 'react';
import {CaptionEditor} from "./CaptionEditor";
import {RelationshipTypeEditor} from "./RelationshipTypeEditor";
import {PropertiesEditor} from "./PropertiesEditor";
import {LabelsEditor} from "./LabelsEditor";

export class GraphTextEditors extends Component {

  constructor(props) {
    super(props)
  }

  editor(entity) {
    if (entity) {
      switch (entity.entityType) {
        case 'node':
          const visualNode = this.props.visualGraph.nodes[entity.id]
          if (visualNode.caption) {
            return [
              <CaptionEditor
                key={'caption-' + visualNode.id}
                visualNode={visualNode}
                onSetNodeCaption={(caption) => this.props.onSetNodeCaption(this.props.selection, caption)}
              />,
              <PropertiesEditor
                key={'properties-' + visualNode.id}
                visualNode={visualNode}
                selection={this.props.selection}
                onSetPropertyKey={this.props.onSetPropertyKey}
                onSetPropertyValue={this.props.onSetPropertyValue}
              />,
              <LabelsEditor
                key={'labels-' + visualNode.id}
                visualNode={visualNode}
                selection={this.props.selection}
                onAddLabel={this.props.onAddLabel}
                onRenameLabel={this.props.onRenameLabel}
              />
            ]
          }
          break

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
    }
    return null
  }
  render() {
    return (
      <div style={{
        transform: this.props.viewTransformation.asCSSTransform(),
        position: 'absolute',
        left: 0,
        top: 0
      }}>
        {this.editor(this.props.selection.editing)}
      </div>
    )
  }
}