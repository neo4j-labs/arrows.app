import React, {Component} from 'react'
import {Segment, Form, Input, Menu, Icon} from 'semantic-ui-react'
import {commonValue} from "../model/values"
import {selectedRelationships} from "../model/selection"
import {combineProperties, combineStyle} from "../model/properties"
import {describeSelection} from "./SelectionCounters"
import PropertyTable from "./PropertyTable"
import StyleTable from "./StyleTable"
import {headerHeight} from "../model/applicationLayout"
import { compose } from "recompose"
import withKeybindings, { TOGGLE_FOCUS } from "../interactions/Keybindings"
import { DetailToolbox } from "./DetailToolbox"
import {nodeStyleAttributes, relationshipStyleAttributes} from "../model/styling";

class DetailInspector extends Component {
  constructor(props) {
    super(props)

    props.registerAction(
      TOGGLE_FOCUS,
      () => {
        if (!this.props.inspectorVisible) {
          this.props.showInspector()
        } else {
          if (document.activeElement.tagName === 'BODY') {
            this.captionInput && this.captionInput.focus()
          }
        }
      })
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
    const {selection, graph, onSaveCaption, onSaveType, reverseRelationships, selectedNodes} = this.props
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

    if (selectionIncludes.nodes) {
      fields.push(
        <StyleTable key='nodeStyle'
                    title='Node Style'
                    style={combineStyle(entities)}
                    graphStyle={graph.style}
                    possibleStyleAttributes={nodeStyleAttributes}
                    onSaveStyle={(styleKey, styleValue) => onSaveArrowsPropertyValue(selection, styleKey, styleValue)}
                    onDeleteStyle={(styleKey) => onDeleteArrowsProperty(selection, styleKey)}
        />
      )
    }

    if (selectionIncludes.relationships) {
      fields.push(
        <StyleTable key='relationshipStyle'
                    title='Relationship Style'
                    style={combineStyle(entities)}
                    graphStyle={graph.style}
                    possibleStyleAttributes={relationshipStyleAttributes}
                    onSaveStyle={(styleKey, styleValue) => onSaveArrowsPropertyValue(selection, styleKey, styleValue)}
                    onDeleteStyle={(styleKey) => onDeleteArrowsProperty(selection, styleKey)}
        />
      )
    }

    return (
      <React.Fragment>
        <Menu
          borderless
          attached='top'
          style={{borderRadius: 0, width: '100%'}}>
          {describeSelection(selection, headerHeight)}
          <Menu.Item
            position='right'
            onClick={this.props.hideInspector}
          >
            <Icon name='angle double right'/>
          </Menu.Item>
        </Menu>
        <DetailToolbox selection={selection} onReverseRelationships={reverseRelationships} />
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            {fields}
          </Form>
        </Segment>
      </React.Fragment>
    )
  }
}

export default compose(
  withKeybindings
)(DetailInspector)

