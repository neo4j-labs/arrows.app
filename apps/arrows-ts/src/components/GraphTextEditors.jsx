import React, { Component } from 'react';
import { CaptionEditor } from './CaptionEditor';
import { RelationshipTypeEditor } from './RelationshipTypeEditor';
import { PropertiesEditor } from './PropertiesEditor';
import { LabelsEditor } from './LabelsEditor';
import { getStyleSelector } from '../selectors/style';
import { NodeCaptionFillNode } from '../graphics/NodeCaptionFillNode';
import { NodeCaptionOutsideNode } from '../graphics/NodeCaptionOutsideNode';
import { measureTextContext } from '../selectors';
import { RelationshipType } from '../graphics/RelationshipType';
import { ComponentStack } from '../graphics/ComponentStack';
import { Vector } from '../model/Vector';

const EditableComponentTypes = ['CAPTION', 'LABELS', 'TYPE', 'PROPERTIES'];

const editableComponentFilter = (component) =>
  EditableComponentTypes.indexOf(component.component.type) !== -1;

export class GraphTextEditors extends Component {
  constructor(props) {
    super(props);
  }

  entityEditor(entity) {
    switch (entity.entityType) {
      case 'node':
        const visualNode = this.props.visualGraph.nodes[entity.id];
        let insideComponents = visualNode.insideComponents;
        let outsideComponents = visualNode.outsideComponents;
        if (
          insideComponents.isEmpty(editableComponentFilter) &&
          outsideComponents.isEmpty(editableComponentFilter)
        ) {
          const style = (styleAttribute) =>
            getStyleSelector(
              visualNode.node,
              styleAttribute
            )(this.props.visualGraph.graph);
          const captionPosition = style('caption-position');
          switch (captionPosition) {
            case 'inside':
              const insideCaption = new NodeCaptionFillNode(
                '',
                visualNode.radius,
                'true',
                style,
                measureTextContext
              );
              insideComponents = new ComponentStack();
              insideComponents.push(insideCaption);
              break;
            default:
              const outsideCaption = new NodeCaptionOutsideNode(
                '',
                visualNode.outsideOrientation,
                true,
                style,
                measureTextContext
              );
              outsideComponents = new ComponentStack();
              outsideComponents.push(outsideCaption);
              break;
          }
        }
        return (
          <div
            style={{
              transform: visualNode.position
                .vectorFromOrigin()
                .asCSSTransform(),
            }}
          >
            {insideComponents.offsetComponents
              .filter(editableComponentFilter)
              .map((offsetComponent) => (
                <div
                  key={offsetComponent.component.type}
                  style={{
                    transform: [
                      `scale(${visualNode.internalScaleFactor})`,
                      `translate(0, ${
                        visualNode.internalVerticalOffset + offsetComponent.top
                      }px)`,
                    ].join(' '),
                  }}
                >
                  {this.componentEditor(visualNode, offsetComponent.component)}
                </div>
              ))}
            {outsideComponents.offsetComponents
              .filter(editableComponentFilter)
              .map((offsetComponent) => (
                <div
                  key={offsetComponent.component.type}
                  style={{
                    transform: visualNode.outsideOffset
                      .plus(new Vector(0, offsetComponent.top))
                      .asCSSTransform(),
                  }}
                >
                  {this.componentEditor(visualNode, offsetComponent.component)}
                </div>
              ))}
          </div>
        );

      case 'relationship':
        let visualRelationship = null;
        this.props.visualGraph.relationshipBundles.forEach(
          (relationshipBundle) => {
            relationshipBundle.routedRelationships.forEach(
              (candidateRelationship) => {
                if (candidateRelationship.id === entity.id) {
                  visualRelationship = candidateRelationship;
                }
              }
            );
          }
        );
        if (visualRelationship) {
          let components = visualRelationship.components;
          if (components.isEmpty(editableComponentFilter)) {
            const style = (styleAttribute) =>
              getStyleSelector(
                visualRelationship.resolvedRelationship.relationship,
                styleAttribute
              )(this.props.visualGraph.graph);
            const type = new RelationshipType(
              '',
              { horizontal: 'center', vertical: 'center' },
              true,
              style,
              measureTextContext
            );
            components = new ComponentStack();
            components.push(type);
          }
          return components.offsetComponents.map((offsetComponent) => (
            <div
              key={offsetComponent.component.type}
              style={{
                transform: [
                  visualRelationship.arrow
                    .midPoint()
                    .vectorFromOrigin()
                    .asCSSTransform(),
                  `rotate(${visualRelationship.componentRotation}rad)`,
                  visualRelationship.componentOffset
                    .plus(new Vector(0, offsetComponent.top))
                    .asCSSTransform(),
                ].join(' '),
              }}
            >
              {this.componentEditor(
                visualRelationship,
                offsetComponent.component
              )}
            </div>
          ));
        }
        break;
    }
    return null;
  }

  componentEditor(visualEntity, component) {
    switch (component.type) {
      case 'CAPTION':
        return (
          <CaptionEditor
            key={'caption-' + visualEntity.id}
            visualNode={visualEntity}
            component={component}
            onSetNodeCaption={(caption) =>
              this.props.onSetNodeCaption(this.props.selection, caption)
            }
            onKeyDown={this.handleKeyDown}
          />
        );
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
        );
      case 'TYPE':
        return (
          <RelationshipTypeEditor
            visualRelationship={visualEntity}
            component={component}
            onSetRelationshipType={(type) =>
              this.props.onSetRelationshipType(this.props.selection, type)
            }
            onKeyDown={this.handleKeyDown}
          />
        );
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
        );
    }
  }

  render() {
    const entity = this.props.selection.editing;
    if (entity) {
      return (
        <div
          style={{
            transform: this.props.viewTransformation.asCSSTransform(),
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          {this.entityEditor(entity)}
        </div>
      );
    } else {
      return null;
    }
  }

  handleKeyDown = (e) => {
    if (e.key === 'Escape' || (e.key === 'Enter' && e.metaKey)) {
      this.props.onExit();
    }
  };
}
