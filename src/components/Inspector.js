import React, {Component} from 'react'
import {Form, Input, Segment, Icon, Header, Button, Dropdown, Divider} from 'semantic-ui-react'
import {connect} from "react-redux";
import {
  setProperties, setNodeCaption, setRelationshipType, renameProperties, removeProperty,
  setArrowsProperties, removeArrowsProperties
} from "../actions/graph";
import {commonValue} from "../model/values";
import {describeSelection, selectedNodes, selectedRelationships} from "../model/selection";
import {combineProperties, combineStyle} from "../model/properties";
import { nodeStyleAttributes } from "../model/styling";
import { getStyleEditorComponent } from "./editors/editorFactory";

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
        <Divider inverted horizontal>Properties</Divider>
        {rows}
      </div>
    )
  }

  stylingSection (style, onSaveArrowsPropertyValue, onDeleteArrowsProperty, graphStyle) {
    const existingStyleAttributes = Object.keys(style)
   /* if (existingStyleAttributes.length === 0) {
      return null
    }*/

    const availableStyleAttributes = nodeStyleAttributes.filter(styleAttr => !existingStyleAttributes.includes(styleAttr))

    const styleElements = []

    const styleOptions = availableStyleAttributes.map(styleAttribute => ({
      text: styleAttribute,
      value: styleAttribute
    }))

    const getStyleValueChangeHandler = styleAttribute => value => onSaveArrowsPropertyValue(this.props.selection, styleAttribute, value)
    const getStyleValueRemoveHandler = styleAttribute => () => onDeleteArrowsProperty(this.props.selection, styleAttribute)

    Object.keys(style).sort().forEach(styleAttribute => {
      const currentValue = style[styleAttribute].status === 'CONSISTENT' ?  style[styleAttribute].value : graphStyle[styleAttribute]
      const editorComponent = getStyleEditorComponent(styleAttribute, currentValue, getStyleValueChangeHandler(styleAttribute), getStyleValueRemoveHandler(styleAttribute))
      styleElements.push(editorComponent)
    })

    const changeStyleElement = styleOptions.length > 0 ? (
      <Form.Group widths='equal' key={'form-group-changeStyle'}>
        <Form.Field>
          <Dropdown
            button
            compact
            selection
            selectOnBlur={false}
            placeholder='Change style'
            options={styleOptions}
            onChange={(evt, data) => {
              console.log(data)
              getStyleValueChangeHandler(data.value)(graphStyle[data.value])
            }}
            key={availableStyleAttributes.join('-')}
          />
        </Form.Field>
        <Form.Field></Form.Field>
      </Form.Group>
    )
      : null

    return (
      <React.Fragment>
        {changeStyleElement}
        {styleElements}
      </React.Fragment>
    )
  }

  render() {
    const {selection, graph, onSaveCaption, onSaveType, onSavePropertyValue, onDeleteArrowsProperty} = this.props
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
          <Divider inverted horizontal>Styling</Divider>
          {this.stylingSection(style, this.props.onSaveArrowsPropertyValue, onDeleteArrowsProperty, graph.style)}
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
    onDeleteArrowsProperty: (selection, key) => {
      dispatch(removeArrowsProperties(selection, [key]))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Inspector)
