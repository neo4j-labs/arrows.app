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
  Cardinality,
  categoriesPresent,
  combineProperties,
  combineStyle,
  graphsDifferInMoreThanPositions,
  styleAttributeGroups,
  summarizeProperties,
  toVisualCardinality,
} from '@neo4j-arrows/model';
import { renderCounters } from './EntityCounters';
import PropertyTable from './PropertyTable';
import StyleTable from './StyleTable';
import { DetailToolbox } from './DetailToolbox';
import { CaptionInspector } from './CaptionInspector';

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
      ontologies,
      selection,
      graph,
      onSaveCaption,
      onSaveCardinality,
      onSaveExamples,
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
    const { onConvertCaptionsToPropertyValues } = this.props;
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
          onConvertCaptionsToPropertyValues={onConvertCaptionsToPropertyValues}
        />
      );
    }

    if (selectionIncludes.relationships && !selectionIncludes.nodes) {
      const commonType = commonValue(
        relationships.map((relationship) => relationship.type)
      );
      const commonCardinality = commonValue(
        relationships.map((relationship) => relationship.cardinality)
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

      fields.push(
        <Form.Field key="_cardinality">
          <label>Cardinality</label>
          <Dropdown
            selection
            value={commonCardinality ?? null}
            placeholder={'Select a cardinality'}
            options={Object.keys(Cardinality).map((cardinality) => {
              return {
                key: cardinality,
                text: toVisualCardinality(cardinality),
                value: cardinality,
              };
            })}
            onChange={(e, { value }) => onSaveCardinality(selection, value)}
          />
        </Form.Field>
      );
    }

    if (selectionIncludes.relationships || selectionIncludes.nodes) {
      const properties = combineProperties(entities);
      const propertySummary = summarizeProperties(entities, graph);

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

      if (entities.length < 2) {
        const { ontologies: entityOntologies, examples } = entities[0];

        fields.push(
          <Form.Field key="_ontology">
            <label>Ontology</label>
            <Dropdown
              selection
              clearable
              value={
                entityOntologies
                  ? entityOntologies.map((ontology) => ontology.id)
                  : null
              }
              multiple
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
                  ontologies.filter((ontology) => value.includes(ontology.id))
                )
              }
            />
          </Form.Field>
        );

        fields.push(
          <Form.Field key="_examples">
            <label>Examples</label>
            <Input
              value={examples}
              onChange={(event) =>
                onSaveExamples(selection, event.target.value)
              }
              placeholder={'Provide examples for this entity'}
            />
          </Form.Field>
        );
      }
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
