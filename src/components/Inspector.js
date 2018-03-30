import React, { Component } from 'react'
import { Form, Input, Segment, Icon, Header, Button, Table } from 'semantic-ui-react'
import { connect } from "react-redux";
import {setProperties, setNodeCaption, setRelationshipType, renameProperties} from "../actions/graph";
import {commonValue} from "../model/values";
import {describeSelection, selectedNodes, selectedRelationships} from "../model/selection";
import {combineProperties} from "../model/properties";

class Inspector extends Component {
  constructor (props) {
    super(props)
    this.newPropElementKey = 1
  }
  state = {
    addProperty: { state: 'empty', key: '', value: '' }
  }

  render() {
    const { selection, graph, onSaveCaption, onSaveType, onSavePropertyValue } = this.props
    const fields = []

    const nodes = selectedNodes(graph, selection)
    const relationships = selectedRelationships(graph, selection)
    const properties = combineProperties([...nodes, ...relationships])

    if (nodes.length > 0 && relationships.length === 0) {
      const commonCaption = commonValue(nodes.map((node) => node.caption)) || ''
      fields.push(
        <Form.Field key='_caption'>
          <label>Caption</label>
          <Input value={commonCaption}
                 onChange={(event) => onSaveCaption(selection, event.target.value)}
                 placeholder='<multiple values>'/>
        </Form.Field>
      )
    }

    if (relationships.length > 0 && nodes.length === 0) {
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

    if (nodes.length > 0 || relationships.length > 0) {
      fields.push(this.propertyTable(properties))
      fields.push((
        <Button onClick={(event) => onSavePropertyValue(selection, '', '')}>+ Property</Button>
      ))
    }

    return (
      <Segment inverted>
        <Header as='h2'>
          <Icon name='edit'/>
          Inspector
        </Header>
        <p>
          {describeSelection(selection)}
        </p>
        <Form inverted style={{ 'textAlign': 'left' }}>
          {fields}
        </Form>
      </Segment>
    )
  }

  propertyInput(key, property) {
    const onChange = (event) => this.props.onSavePropertyValue(this.props.selection, key, event.target.value)
    switch(property.status) {
      case 'CONSISTENT':
        return (
          <Input value={property.value} onChange={onChange}/>
        )

      case 'INCONSISTENT':
        return (
          <Input value={''} placeholder="<multiple values>" onChange={onChange}/>
        )

      default:
        return (
          <Input value={''} placeholder="<partially present>" onChange={onChange}/>
        )
    }
  }

  propertyTable(properties) {
    const rows = Object.keys(properties).map((key) => {
      return (
        <Table.Row>
          <Table.Cell><Input value={key} onChange={(event) => this.props.onSavePropertyKey(this.props.selection, key, event.target.value)}/></Table.Cell>
          <Table.Cell>{this.propertyInput(key, properties[key])}</Table.Cell>
        </Table.Row>
      )
    })
    return (
      <Table inverted>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign='right'>Key</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
        </Table.Body>
      </Table>
    )
  }
}

const mapStateToProps = state => {
  return {
    graph: state.graph,
    selection: state.gestures.selection
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSaveCaption: (selection, caption) => {
      dispatch(setNodeCaption(selection, caption))
    },
    onSaveType: (selection, type) => {
      dispatch(setRelationshipType(selection, type))
    },
    onSavePropertyKey: (selection, oldPropertyKey, newPropertyKey) => {
      dispatch(renameProperties(selection, oldPropertyKey, newPropertyKey))
    },
    onSavePropertyValue: (selection, key, value) => {
      dispatch(setProperties(selection, [{ key, value }]))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Inspector)
