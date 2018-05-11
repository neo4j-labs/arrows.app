import React, {Component} from 'react'
import {Form, Input, Segment, Icon, Header, Button, Label} from 'semantic-ui-react'
import {connect} from "react-redux";
import {
  setProperties, setNodeCaption, setRelationshipType, renameProperties, removeProperty,
  setArrowsProperties
} from "../actions/graph";
import {commonValue} from "../model/values";
import {describeSelection, selectedNodes, selectedRelationships} from "../model/selection";
import {combineProperties, combineStyle} from "../model/properties";
import { SketchPicker } from 'react-color'

class Inspector extends Component {
  constructor(props) {
    super(props)
    this.newPropElementKey = 1
  }

  state = {
    addProperty: {state: 'empty', key: '', value: ''},
    displayColorPicker: false
  }

  propertyInput(property) {
    switch (property.status) {
      case 'CONSISTENT':
        return {valueFieldValue: property.value, valueFieldPlaceHolder: null}

      case 'INCONSISTENT':
        return {valueFieldValue: '', valueFieldPlaceHolder: '<multiple values>'}

      default:
        return {valueFieldValue: '', valueFieldPlaceHolder: '<partially present>'}
    }
  }

  propertyTable(properties) {
    const rows = Object.keys(properties).map((key, index) => {
      const onKeyChange = (event) => this.props.onSavePropertyKey(this.props.selection, key, event.target.value);
      const onValueChange = (event) => this.props.onSavePropertyValue(this.props.selection, key, event.target.value)
      const onDeleteProperty = (event) => this.props.onDeleteProperty(this.props.selection, key)
      const {valueFieldValue, valueFieldPlaceHolder} = this.propertyInput(properties[key])
      return (
        <Form.Group widths='equal' key={'form-group-'+ index}>
          <Form.Field>
            <Input fluid value={key} onChange={onKeyChange} label=':' labelPosition='right' className={'property-key'}/>
          </Form.Field>
          <Form.Field>
            <Input fluid value={valueFieldValue} placeholder={valueFieldPlaceHolder} onChange={onValueChange}
                      action={{icon: 'close', onClick: onDeleteProperty}}/>
          </Form.Field>
        </Form.Group>
      )
    })
    return (
      <div key='propertiesTable'>
        <Form.Field>
          <label>Properties</label>
        </Form.Field>
        {rows}
      </div>
    )
  }

  stylingSection ({color}) {
    const displayColorPicker = this.state.displayColorPicker
    const currentColor = color.status === 'CONSISTENT' ? color.value : '#e0e1e2'
    return (
      <div>
        <div>
          <Label style={{background : currentColor}} onClick={()=>this.setState({displayColorPicker: !this.state.displayColorPicker})}>
            <span >
              Color
            </span>
            <Label.Detail><Icon name={displayColorPicker ? "chevron up" : "chevron down"}/></Label.Detail>
          </Label>
        </div>
        {displayColorPicker ?
          <SketchPicker
            color={currentColor}
            onChangeComplete={color => {
              this.setState({ displayColorPicker: false })
              this.props.onSaveArrowsPropertyValue(this.props.selection, 'color', color.hex)
            }}
          /> : null
        }
      </div>
    )
  }

  render() {
    const {selection, graph, onSaveCaption, onSaveType, onSavePropertyValue} = this.props
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
        <Button key='saveButton' onClick={(event) => onSavePropertyValue(selection, '', '')}>+ Property</Button>
      ))
    }

    if (nodes.length > 0) {
      const style = combineStyle(nodes)
      fields.push(
        <div key='styling' style={{ marginTop: '1em' }}>
          <Form.Field>
            <label>Styling</label>
          </Form.Field>
          <Form.Field>
            {this.stylingSection(style)}
          </Form.Field>
        </div>
      )
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
        <Form inverted style={{'textAlign': 'left'}}>
          {fields}
        </Form>
      </Segment>
    )
  }

}

const mapStateToProps = state => {
  return {
    graph: state.graph,
    selection: state.selection
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
      dispatch(setProperties(selection, [{key, value}]))
    },
    onSaveArrowsPropertyValue: (selection, key, value) => {
      dispatch(setArrowsProperties(selection, [{key, value}]))
    },
    onDeleteProperty: (selection, key) => {
      dispatch(removeProperty(selection, key))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Inspector)
