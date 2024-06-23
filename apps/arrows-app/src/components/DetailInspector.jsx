import React, { Component } from 'react';
import {
  Segment,
  Divider,
  Dropdown,
  Form,
  Input,
  ButtonGroup,
  Button,
} from 'semantic-ui-react';
import { commonValue } from '../model/values';
import {
  selectedNodeIds,
  selectedRelationshipIds,
  selectedRelationships,
} from '../model/selection';
import {
  combineProperties,
  combineStyle,
  summarizeProperties,
} from '../model/properties';
import { renderCounters } from './EntityCounters';
import PropertyTable from './PropertyTable';
import StyleTable from './StyleTable';
import { DetailToolbox } from './DetailToolbox';
import { categoriesPresent, styleAttributeGroups } from '../model/styling';
import { combineLabels, summarizeLabels } from '../model/labels';
import LabelTable from './LabelTable';
import { CaptionInspector } from './CaptionInspector';
import { graphsDifferInMoreThanPositions } from '../model/Graph';
import { ontologies } from '../../../../libs/model/src/lib/Ontology';

export default class DetailInspector extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      nextProps.inspectorVisible &&
      (graphsDifferInMoreThanPositions(this.props.graph, nextProps.graph) ||
        this.props.selection !== nextProps.selection ||
        this.props.cachedImages !== nextProps.cachedImages)
    );
  }

  moveCursorToEnd(e) {
    const temp_value = e.target.value;
    e.target.value = '';
    e.target.value = temp_value;
    e.target.select();
  }

  componentDidUpdate(prevProps) {
    if (this.props.inspectorVisible && !prevProps.inspectorVisible) {
      this.captionInput && this.captionInput.focus();
    }
  }

  render() {
    const {
      selection,
      graph,
      onSaveCaption,
      onSaveType,
      onDuplicate,
      onDelete,
    } = this.props;
    const {
      reverseRelationships,
      inlineRelationships,
      mergeNodes,
      selectedNodes,
      onSelect,
    } = this.props;
    const { onConvertCaptionsToLabels, onConvertCaptionsToPropertyValues } =
      this.props;
    const { onAddLabel, onRenameLabel, onRemoveLabel } = this.props;
    const { onSaveArrowsPropertyValue, onDeleteArrowsProperty } = this.props;
    const {
      onMergeOnValues,
      onSavePropertyKey,
      onSavePropertyValue,
      onDeleteProperty,
      onSaveOntology,
    } = this.props;
    const fields = [];

    const relationships = selectedRelationships(graph, selection);
    const entities = [...selectedNodes, ...relationships];
    const selectionIncludes = {
      nodes: selectedNodes.length > 0,
      relationships: relationships.length > 0,
    };

    fields.push(
      <Divider key="DataDivider" horizontal clearing style={{ paddingTop: 50 }}>
        Data
      </Divider>
    );

    if (selectionIncludes.nodes && !selectionIncludes.relationships) {
      const value = commonValue(selectedNodes.map((node) => node.caption));

      fields.push(
        <CaptionInspector
          key="caption"
          value={value}
          onSaveCaption={(caption) => onSaveCaption(selection, caption)}
          onConvertCaptionsToLabels={onConvertCaptionsToLabels}
          onConvertCaptionsToPropertyValues={onConvertCaptionsToPropertyValues}
        />
      );
    }

    if (selectionIncludes.nodes) {
      const labels = combineLabels(selectedNodes);
      const labelSummary = summarizeLabels(entities, graph);

      fields.push(
        <LabelTable
          key="labels"
          labels={labels}
          labelSummary={labelSummary}
          onAddLabel={(label) => onAddLabel(selection, label)}
          onRenameLabel={(oldLabel, newLabel) =>
            onRenameLabel(selection, oldLabel, newLabel)
          }
          onRemoveLabel={(label) => onRemoveLabel(selection, label)}
        />
      );
    }

    if (selectionIncludes.relationships && !selectionIncludes.nodes) {
      const commonType = commonValue(
        relationships.map((relationship) => relationship.type)
      );

      fields.push(
        <Form.Field key="_type">
          <label>Type</label>
          <Input
            value={commonType || ''}
            onChange={(event) => onSaveType(selection, event.target.value)}
            placeholder={commonType === undefined ? '<multiple types>' : null}
          />
        </Form.Field>
      );
    }

    if (selectionIncludes.relationships || selectionIncludes.nodes) {
      const properties = combineProperties(entities);
      const propertySummary = summarizeProperties(entities, graph);
      const ontology = commonValue(
        entities
          .filter((entity) => entity.ontology)
          .map((entity) => entity.ontology.id)
      );

      fields.push(
        <PropertyTable
          key={`properties-${entities.map((entity) => entity.id).join(',')}`}
          properties={properties}
          propertySummary={propertySummary}
          onMergeOnValues={(propertyKey) =>
            onMergeOnValues(selection, propertyKey)
          }
          onSavePropertyKey={(oldPropertyKey, newPropertyKey) =>
            onSavePropertyKey(selection, oldPropertyKey, newPropertyKey)
          }
          onSavePropertyValue={(propertyKey, propertyValue) =>
            onSavePropertyValue(selection, propertyKey, propertyValue)
          }
          onDeleteProperty={(propertyKey) =>
            onDeleteProperty(selection, propertyKey)
          }
        />
      );

      fields.push(
        <Form.Field key="_ontology">
          <label>Ontology</label>
          <Dropdown
            selection
            clearable
            value={ontology ?? null}
            placeholder={'Select an ontology'}
            options={ontologies.map((ontology) => {
              return {
                key: ontology.id,
                text: ontology.id,
                value: ontology.id,
              };
            })}
            onChange={(e, { value }) =>
              onSaveOntology(
                selection,
                ontologies.find((ontology) => ontology.id === value)
              )
            }
          />
        </Form.Field>
      );
    }

    fields.push(
      <Divider
        key="StyleDivider"
        horizontal
        clearing
        style={{ paddingTop: 50 }}
      >
        Style
      </Divider>
    );

    fields.push(
      <div
        style={{
          clear: 'both',
          textAlign: 'center',
        }}
      >
        <ButtonGroup>
          <Button secondary>Customize</Button>
        </ButtonGroup>
      </div>
    );

    const relevantCategories = categoriesPresent(
      selectedNodes,
      relationships,
      graph
    );

    for (const group of styleAttributeGroups) {
      const relevantKeys = group.attributes
        .filter((attribute) => relevantCategories.includes(attribute.appliesTo))
        .map((attribute) => attribute.key);
      if (relevantKeys.length > 0) {
        fields.push(
          <StyleTable
            key={group.name + 'Style'}
            title={group.name}
            style={combineStyle(entities)}
            graphStyle={graph.style}
            possibleStyleAttributes={relevantKeys}
            cachedImages={this.props.cachedImages}
            onSaveStyle={(styleKey, styleValue) =>
              onSaveArrowsPropertyValue(selection, styleKey, styleValue)
            }
            onDeleteStyle={(styleKey) =>
              onDeleteArrowsProperty(selection, styleKey)
            }
          />
        );
      }
    }

    const disabledSubmitButtonToPreventImplicitSubmission = (
      <button
        type="submit"
        disabled
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    );

    return (
      <React.Fragment>
        <Segment basic style={{ margin: 0 }}>
          <Form style={{ textAlign: 'left' }}>
            {disabledSubmitButtonToPreventImplicitSubmission}
            <Form.Field key="_selected">
              <label>Selection:</label>
              {renderCounters(
                selectedNodeIds(selection),
                selectedRelationshipIds(selection),
                onSelect,
                'blue'
              )}
            </Form.Field>
            <DetailToolbox
              graph={graph}
              selection={selection}
              onReverseRelationships={reverseRelationships}
              onInlineRelationships={(selection) => {
                return inlineRelationships(selection);
              }}
              onMergeNodes={mergeNodes}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
            {fields}
          </Form>
        </Segment>
      </React.Fragment>
    );
  }
}
