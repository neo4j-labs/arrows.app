import React, {Component} from 'react'
import {Segment, Form, Input} from 'semantic-ui-react'
import {commonValue} from "../model/values"
import {selectedRelationships} from "../model/selection"
import {combineProperties, combineStyle} from "../model/properties"
import {describeSelection} from "./SelectionCounters"
import PropertyTable from "./PropertyTable"
import StyleTable from "./StyleTable"
import { DetailToolbox } from "./DetailToolbox"
import {styleGroups, styleAttributes} from "../model/styling";
import {combineLabels} from "../model/labels";
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
    const {selection, graph, onSaveCaption, onSaveType, reverseRelationships, selectedNodes, onSelect} = this.props
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
    const labels = combineLabels(selectedNodes)

    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape' || (evt.key === 'Enter' && evt.metaKey)) {
        this.captionInput.inputRef && this.captionInput.inputRef.blur()
      }
    }

    if (selectionIncludes.nodes && !selectionIncludes.relationships) {
      const value = commonValue(selectedNodes.map((node) => node.caption));
      const fieldValue = value || ''
      const placeholder = value === undefined ? '<multiple values>' : null
      fields.push(
        <Form.Field key='_caption'>
          <label>Caption</label>
          <Input value={fieldValue}
                 onFocus={this.moveCursorToEnd}
                 onChange={(event) => onSaveCaption(selection, event.target.value)}
                 placeholder={placeholder}
                 ref={elm => this.captionInput = elm}
                 onKeyDown={handleKeyDown.bind(this)}/>
        </Form.Field>
      )
    }

    if (selectionIncludes.nodes) {
      fields.push(
        <LabelTable
          key='labels'
          labels={labels}
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
        <PropertyTable key='properties'
                       properties={properties}
                       onSavePropertyKey={(oldPropertyKey, newPropertyKey) => onSavePropertyKey(selection, oldPropertyKey, newPropertyKey)}
                       onSavePropertyValue={(propertyKey, propertyValue) => onSavePropertyValue(selection, propertyKey, propertyValue)}
                       onDeleteProperty={(propertyKey) => onDeleteProperty(selection, propertyKey)}
        />
      )
    }

    Object.entries(styleGroups).forEach(([groupKey, styleGroup]) => {
      if (styleGroup.relevantTo(selectedNodes, relationships)) {
        fields.push(
          <StyleTable key={groupKey + 'Style'}
                      title={groupKey + ' Style'}
                      style={combineStyle(entities)}
                      graphStyle={graph.style}
                      possibleStyleAttributes={Object.keys(styleAttributes).filter(key => styleAttributes[key].appliesTo === groupKey)}
                      onSaveStyle={(styleKey, styleValue) => onSaveArrowsPropertyValue(selection, styleKey, styleValue)}
                      onDeleteStyle={(styleKey) => onDeleteArrowsProperty(selection, styleKey)}
          />
        )
      }
    })

    return (
      <React.Fragment>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            <Form.Field key='_selected'>
              <label>Selected</label>
              {describeSelection(selection, onSelect)}
            </Form.Field>
            <DetailToolbox selection={selection} onReverseRelationships={reverseRelationships}/>
            {fields}
          </Form>
        </Segment>
      </React.Fragment>
    )
  }
}

