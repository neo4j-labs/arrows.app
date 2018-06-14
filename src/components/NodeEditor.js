import React, { Component } from 'react'
import { Form, Segment, Icon, Header, Divider } from 'semantic-ui-react'
import EagerInput from './EagerInput'
import { connect } from "react-redux";
import { setProperty, setNodeCaption } from "../actions/graph";

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
      this.props.onSavePropertyValue(this.props.item.id, addProperty.key, addProperty.value)
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
    const { item, onSaveCaption, onSaveProperty } = this.props
    const { addProperty } = this.state
    if (!item) {
      return null
    }
    const nodeId = item.id

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
      <Segment inverted>
        <Header as='h2' icon>
          <Icon name='settings'/>
          Node Settings
        </Header>
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
      </Segment>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSaveCaption: (nodeId, caption) => {
      dispatch(setNodeCaption(nodeId, caption))
    },
    onSavePropertyValue: (nodeId, key, value) => {
      dispatch(setProperty(nodeId, key, value))
    }
  }
}

export default connect(
  null,
  mapDispatchToProps
)(NodeEditor)
