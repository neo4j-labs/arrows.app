import React, {Component} from 'react'
import {Segment, Form, Input, Menu, Icon} from 'semantic-ui-react'
import {commonValue} from "../model/values";
import {selectedNodes, selectedRelationships} from "../model/selection";
import {combineProperties, combineStyle} from "../model/properties";
import {describeSelection} from "./SelectionCounters";
import PropertyTable from "./PropertyTable";
import StyleTable from "./StyleTable";

export class DetailInspector extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {selection, graph, onSaveCaption, onSaveType} = this.props
    const {onSaveArrowsPropertyValue, onDeleteArrowsProperty} = this.props
    const {onSavePropertyKey, onSavePropertyValue, onDeleteProperty} = this.props
    const fields = []

    const nodes = selectedNodes(graph, selection)
    const relationships = selectedRelationships(graph, selection)
    const entities = [...nodes, ...relationships];
    const selectionIncludes = {
      nodes: nodes.length > 0,
      relationships: relationships.length > 0
    }
    const properties = combineProperties(entities)

    if (selectionIncludes.nodes && !selectionIncludes.relationships) {
      const value = commonValue(nodes.map((node) => node.caption));
      const fieldValue = value || ''
      const placeholder = value === undefined ? '<multiple values>' : null
      fields.push(
        <Form.Field key='_caption'>
          <label>Caption</label>
          <Input value={fieldValue}
                 onChange={(event) => onSaveCaption(selection, event.target.value)}
                 placeholder={placeholder}/>
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
      fields.push(
        <StyleTable key='style'
          style={combineStyle(entities)}
          graphStyle={graph.style}
          selectionIncludes={selectionIncludes}
          onSaveStyle={(styleKey, styleValue) => onSaveArrowsPropertyValue(selection, styleKey, styleValue)}
          onDeleteStyle={(styleKey) => onDeleteArrowsProperty(selection, styleKey)}
        />
      )
    }

    return (
      <React.Fragment>
        <Menu borderless attached='top' style={{borderRadius: 0}}>
          <Menu.Item style={{height: '40px'}}>
            <Icon name='info circle'/>
            {describeSelection(selection)}
          </Menu.Item>
          <Menu.Item position='right'>
            <Icon name='angle double right'/>
          </Menu.Item>
        </Menu>
        <Segment basic style={{margin: 0}}>
          <Form style={{textAlign: 'left'}}>
            {fields}
          </Form>
        </Segment>
      </React.Fragment>
    )
  }
}
