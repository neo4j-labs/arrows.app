import React, { Component } from 'react'
import { Form, Input, Segment, Icon, Header, Divider } from 'semantic-ui-react'
import EagerInput from './EagerInput'
import { connect } from "react-redux";
import {setNodeProperties, setNodeCaption, setRelationshipType} from "../actions/graph";
import {commonValue} from "../model/values";
import {selectedNodes, selectedRelationships} from "../model/selection";

class Inspector extends Component {
  constructor (props) {
    super(props)
    this.newPropElementKey = 1
  }
  state = {
    addProperty: { state: 'empty', key: '', value: '' }
  }

  setAddPropertyState (value) {
    if (value) {
      this.setState({ addProperty: {
          state: 'key',
          key: value,
          value: this.state.value || ''
        }})
    } else {
      this.setState({ addProperty: { state: 'empty' }})
    }
  }

  savePropertyKey (e) {
    const { addProperty } = this.state
    if(e.key ==='Enter' && addProperty.key) {
      this.setState({
        addProperty: Object.assign(addProperty, { state: 'value' })
      })
    }
  }

  savePropertyValue () {
    const { addProperty } = this.state
    if (addProperty.value) {
      this.props.onSaveProperty(this.props.item.id, addProperty.key, addProperty.value)
      this.newPropElementKey++
      this.setState({
        addProperty: {
          state: 'empty',
          key: '',
          value: ''
        }})
    } else {
      this.setState({ addProperty: { state: 'key' } })
    }
  }

  render() {
    const { selection, graph, onSaveCaption, onSaveType } = this.props
    const fields = []

    const nodes = selectedNodes(graph, selection);
    const relationships = selectedRelationships(graph, selection);

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
      const commonType = commonValue(relationships.map((relationship) => relationship.type)) || ''
      fields.push(
        <Form.Field key='_type'>
          <label>Caption</label>
          <Input value={commonType}
                 onChange={(event) => onSaveType(selection, event.target.value)}
                 placeholder='<multiple types>'/>
        </Form.Field>
      )
    }

    return (
      <Segment inverted>
        <Header as='h2'>
          <Icon name='edit'/>
          Inspector
        </Header>
        <p>
          Selection: {nodes.length} nodes.
        </p>
        <Form inverted style={{ 'textAlign': 'left' }}>
          {fields}
        </Form>
      </Segment>
    )
  }

  renderPropertyEditor() {
    const { selection, graph, onSaveCaption, onSaveProperty } = this.props

    const item = null
    if (!item) {
      return null
    }
    const nodeId = item.id
    const { addProperty } = this.state

    const addPropertyKeyElement = (
      <Form.Field key={nodeId + '_newPropKey' + this.newPropElementKey}>
        {addProperty.state === 'value'  ? <label>{addProperty.key}</label> : null}
        <EagerInput
          hidden={addProperty.state === 'value'}
          value={addProperty.key}
          delay={1}
          placeholder='Property Key'
          onSave={this.setAddPropertyState.bind(this)}
          onKeyPress={this.savePropertyKey.bind(this)}
        />
        <EagerInput
          action={{content: 'Save', onClick: this.savePropertyValue.bind(this)}}
          autoFocus
          delay={1}
          hidden={addProperty.state !== 'value'}
          value={addProperty.value}
          placeholder='Value'
          onSave={(val) => this.setState({ addProperty: Object.assign({}, this.state.addProperty, { value: val }) })}
        />
      </Form.Field>
    )

    return (
      <Form inverted style={{ 'textAlign': 'left' }}>
        <Form.Field key={nodeId + '_caption'}>
          <label>Caption</label>
          <EagerInput value={item.caption} onSave={(value) => onSaveCaption(nodeId, value)}
                      placeholder='Node Caption'/>
        </Form.Field>
        <Divider horizontal inverted>Properties</Divider>
        {
          Object.keys(item.properties).map(propertyKey =>
            <Form.Field key={nodeId + propertyKey}>
              <label>{propertyKey}</label>
              <EagerInput
                placeholder={propertyKey}
                value={item.properties[propertyKey]}
                onSave={(val) => onSaveProperty(nodeId, propertyKey, val)}/>
            </Form.Field>
          )
        }
        <Divider horizontal inverted>New Property</Divider>
        {addPropertyKeyElement}
      </Form>
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
    onSaveProperty: (selection, key, value) => {
      dispatch(setNodeProperties(selection, [{ key, value }]))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Inspector)
