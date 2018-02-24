import React, { Component } from 'react'
import { Form, Segment, Icon, Header, Divider } from 'semantic-ui-react'
import EagerInput from './EagerInput'
import { modifyGraph } from "../actions/neo4jStorage";
import { connect } from "react-redux";
import { updateNodeProperties } from "../actions/graph";
import { editNode } from "../actions/sidebar";

class NodeEditor extends Component {
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
      this.props.onSave(this.props.item.id, addProperty.key, addProperty.value)
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
    const { item, onSave } = this.props
    const { addProperty } = this.state
    if (!item) {
      return null
    }
    const nodeId = item.id

    const addPropertyKeyElement = (
      <Form.Field key={nodeId.value + '_newPropKey' + this.newPropElementKey}>
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
      <Segment inverted>
        <Header as='h2' icon>
          <Icon name='settings'/>
          Node Settings
        </Header>
        <Form inverted style={{ 'textAlign': 'left' }}>
          <Form.Field key={nodeId.value + '_caption'}>
            <label>Caption</label>
            <EagerInput value={item.caption} onSave={(value) => onSave(nodeId, '_caption', value)}
                        placeholder='Node Caption'/>
          </Form.Field>
          <Divider horizontal inverted>Properties</Divider>
          {
            Object.keys(item.properties).map(propertyKey =>
              <Form.Field key={nodeId.value + propertyKey}>
                <label>{propertyKey}</label>
                <EagerInput
                  placeholder={propertyKey}
                  value={item.properties[propertyKey]}
                  onSave={(val) => onSave(nodeId, propertyKey, val)}/>
              </Form.Field>
            )
          }
          <Divider horizontal inverted>New Property</Divider>
          {addPropertyKeyElement}
        </Form>
      </Segment>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSave: (nodeId, key, value) => {
      dispatch(modifyGraph(updateNodeProperties(nodeId, [{ key, value }])))
    }
  }
}

export default connect(
  null,
  mapDispatchToProps
)(NodeEditor)
