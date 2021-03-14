import React, {Component} from 'react'
import {Segment, Divider, Form, Input, Button, Popup} from 'semantic-ui-react'
import {commonValue} from "../model/values"
import {selectedRelationships} from "../model/selection"
import {combineProperties, combineStyle, summarizeProperties} from "../model/properties"
import {describeSelection} from "./SelectionCounters"
import PropertyTable from "./PropertyTable"
import StyleTable from "./StyleTable"
import { DetailToolbox } from "./DetailToolbox"
import {categoriesPresent, styleAttributeGroups} from "../model/styling";
import {combineLabels, summarizeLabels} from "../model/labels";
import LabelTable from "./LabelTable";

export default class DetailInspector extends Component {
  constructor(props) {
    super(props)
  }

  moveCursorToEnd(e) {
    const temp_value = e.target.value
    e.target.value = ''
    e.target.value = temp_value
    e.target.select()
  }

  componentDidUpdate (prevProps) {
    if (this.props.inspectorVisible && !prevProps.inspectorVisible) {
      this.captionInput && this.captionInput.focus()
    }
  }

  render() {
    const {selection, graph, onSaveCaption, onSaveType, onDuplicate, reverseRelationships, selectedNodes, onSelect} = this.props
    const {onConvertCaptionsToLabels, onConvertCaptionsToPropertyValues} = this.props
    const {onAddLabel, onRenameLabel, onRemoveLabel} = this.props
    const {onSaveArrowsPropertyValue, onDeleteArrowsProperty} = this.props
    const {onSavePropertyKey, onSavePropertyValue, onDeleteProperty} = this.props
    const fields = []

    const relationships = selectedRelationships(graph, selection)
    const entities = [...selectedNodes, ...relationships];
    const selectionIncludes = {
      nodes: selectedNodes.length > 0,
      relationships: relationships.length > 0
    }

    const properties = combineProperties(entities)
    const propertySummary = summarizeProperties(entities, graph)
    const labels = combineLabels(selectedNodes)
    const labelSummary = summarizeLabels(entities, graph)

    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape' || (evt.key === 'Enter' && evt.metaKey)) {
        this.captionInput.inputRef && this.captionInput.inputRef.blur()
      }
    }

    if (selectionIncludes.nodes && !selectionIncludes.relationships) {
      const value = commonValue(selectedNodes.map((node) => node.caption));
      const fieldValue = value || ''
      const placeholder = value === undefined ? '<multiple values>' : null
      const textBox = (
        <Input value={fieldValue}
               onFocus={this.moveCursorToEnd}
               onChange={(event) => onSaveCaption(selection, event.target.value)}
               placeholder={placeholder}
               ref={elm => this.captionInput = elm}
               onKeyDown={handleKeyDown.bind(this)}/>
      )
      const buttons = (
        <div>
          <Button
            key='convertCaptionsToLabels'
            onClick={onConvertCaptionsToLabels}
            basic
            color='black'
            floated='right'
            size="tiny"
            content='Use captions as labels'
            type='button'
          />
          <Button
            key='convertCaptionsToProperties'
            onClick={onConvertCaptionsToPropertyValues}
            basic
            color='black'
            floated='right'
            size="tiny"
            content='Use captions as properties'
            type='button'
          />
        </div>
      )
      fields.push(
        <Form.Field key='_caption'>
          <label>Caption</label>
          <Popup
            trigger={textBox}
            content={buttons}
            on='click'
            position='bottom center'
          />
        </Form.Field>
      )
    }

    if (selectionIncludes.nodes) {
      fields.push(
        <LabelTable
          key='labels'
          labels={labels}
          labelSummary={labelSummary}
          onAddLabel={(label) => onAddLabel(selection, label)}
          onRenameLabel={(oldLabel, newLabel) => onRenameLabel(selection, oldLabel, newLabel)}
          onRemoveLabel={(label) => onRemoveLabel(selection, label)}
        />
      )
    }

    if (selectionIncludes.relationships && !selectionIncludes.nodes) {
      const commonType = commonValue(relationships.map((relationship) => relationship.type))
      fields.push(
        <Form.Field key='_type'>
          <label>Type</label>
          <Input value={commonType || ''}
                 onChange={(event) => onSaveType(selection, event.target.value)}
                 placeholder={commonType === undefined ? '<multiple types>' : null}/>
        </Form.Field>
      )
    }

    if (selectionIncludes.relationships || selectionIncludes.nodes) {
      fields.push(
        <PropertyTable key={`properties-${entities.map(entity => entity.id).join(',')}`}
                       properties={properties}
                       propertySummary={propertySummary}
                       onSavePropertyKey={(oldPropertyKey, newPropertyKey) => onSavePropertyKey(selection, oldPropertyKey, newPropertyKey)}
                       onSavePropertyValue={(propertyKey, propertyValue) => onSavePropertyValue(selection, propertyKey, propertyValue)}
                       onDeleteProperty={(propertyKey) => onDeleteProperty(selection, propertyKey)}
        />
      )
    }

    fields.push((
      <Divider
        key='StyleDivider'
        horizontal
        clearing
        style={{paddingTop: 50}}
      >Style</Divider>
    ))

    const relevantCategories = categoriesPresent(selectedNodes, relationships, graph)

    for (const group of styleAttributeGroups) {
      const relevantKeys = group.attributes
        .filter(attribute => relevantCategories.includes(attribute.appliesTo))
        .map(attribute => attribute.key)
      if (relevantKeys.length > 0) {
        fields.push(
          <StyleTable key={group.name + 'Style'}
                      title={group.name}
                      style={combineStyle(entities)}
                      graphStyle={graph.style}
                      possibleStyleAttributes={relevantKeys}
                      onSaveStyle={(styleKey, styleValue) => onSaveArrowsPropertyValue(selection, styleKey, styleValue)}
                      onDeleteStyle={(styleKey) => onDeleteArrowsProperty(selection, styleKey)}
          />
        )
      }
    }

    const disabledSubmitButtonToPreventImplicitSubmission = (
      <button type="submit" disabled style={{display: 'none'}} aria-hidden="true"/>
    )

    return (
      <React.Fragment>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            {disabledSubmitButtonToPreventImplicitSubmission}
            <Form.Field key='_selected'>
              <label>Selected</label>
              {describeSelection(selection, onSelect)}
            </Form.Field>
            <DetailToolbox
              selection={selection}
              onReverseRelationships={reverseRelationships}
              onDuplicate={onDuplicate}
            />
            {fields}
          </Form>
        </Segment>
      </React.Fragment>
    )
  }
}

