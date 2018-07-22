import React, {Component} from 'react'
import {Form, Input, Table, Button, Dropdown} from 'semantic-ui-react'
import {connect} from "react-redux";
import {
  setProperty, setNodeCaption, setRelationshipType, renameProperty, removeProperty,
  setArrowsProperty, removeArrowsProperty
} from "../actions/graph";
import {commonValue} from "../model/values";
import {describeSelection, selectedNodes, selectedRelationships} from "../model/selection";
import {combineProperties, combineStyle} from "../model/properties";
import {nodeStyleAttributes, relationshipStyleAttributes} from "../model/styling";
import {PropertyRow} from "./PropertyRow";
import {StyleRow} from "./StyleRow";

class DetailInspector extends Component {
  constructor(props) {
    super(props)
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

  propertyTable(selection, properties) {
    const rows = Object.keys(properties).map((propertyKey, index) => {
      const onKeyChange = (event) => this.props.onSavePropertyKey(this.props.selection, propertyKey, event.target.value);
      const onValueChange = (event) => this.props.onSavePropertyValue(this.props.selection, propertyKey, event.target.value)
      const onDeleteProperty = (event) => this.props.onDeleteProperty(this.props.selection, propertyKey)
      const {valueFieldValue, valueFieldPlaceHolder} = this.propertyInput(properties[propertyKey])
      return (
        <PropertyRow
          key={'row-' + index}
          propertyKey={propertyKey}
          onKeyChange={onKeyChange}
          onValueChange={onValueChange}
          onDeleteProperty={onDeleteProperty}
          valueFieldValue={valueFieldValue}
          valueFieldPlaceHolder={valueFieldPlaceHolder}
        />
      )
    })
    return (
      <Form.Field key='propertiesTable'>
        <label>Properties</label>
        <Table compact collapsing style={{marginTop: 0}}>
          <Table.Body>
            {rows}
          </Table.Body>
        </Table>
        <Button
          key='addProperty'
          onClick={(event) => this.props.onSavePropertyValue(selection, '', '')}
          basic
          floated='right'
          size="tiny"
          icon="plus"
          content='Property'
        />
      </Form.Field>
    )
  }

  stylingSection (style, selectionIncludes, onSaveArrowsPropertyValue, onDeleteArrowsProperty, graphStyle) {
    const existingStyleAttributes = Object.keys(style)
    const possibleStyleAttributes = []
      .concat(selectionIncludes.nodes ? nodeStyleAttributes : [])
      .concat(selectionIncludes.relationships ? relationshipStyleAttributes : [])

    const availableStyleAttributes = possibleStyleAttributes.filter(styleAttr => !existingStyleAttributes.includes(styleAttr))
    const rows = []

    const styleOptions = availableStyleAttributes.map(styleAttribute => ({
      text: styleAttribute,
      value: styleAttribute
    }))

    Object.keys(style).sort().forEach(styleKey => {
      const styleValue = style[styleKey].status === 'CONSISTENT' ?  style[styleKey].value : graphStyle[styleKey]
      const onValueChange = value => onSaveArrowsPropertyValue(this.props.selection, styleKey, value)
      const onDeleteStyle = () => onDeleteArrowsProperty(this.props.selection, styleKey)
      rows.push((
        <StyleRow
          key={styleKey}
          styleKey={styleKey}
          styleValue={styleValue}
          onValueChange={onValueChange}
          onDeleteStyle={onDeleteStyle}
        />
        )
      )
    })

    const changeStyleElement = styleOptions.length > 0 ? (
      <Form.Group widths='equal' key={'form-group-changeStyle'}>
        <Form.Field>
          <Dropdown
            button
            selectOnBlur={false}
            placeholder='+ Style'
            options={styleOptions}
            onChange={(evt, data) => {
              return onSaveArrowsPropertyValue(this.props.selection, data.value, graphStyle[data.value]);
            }}
            key={availableStyleAttributes.join('-')}
          />
        </Form.Field>
        <Form.Field></Form.Field>
      </Form.Group>
    )
      : null

    return (
      <Form.Field key='styleTable'>
        <label>Style</label>
        <Table compact collapsing style={{marginTop: 0}}>
          <Table.Body>
            {rows}
          </Table.Body>
        </Table>
        {changeStyleElement}
      </Form.Field>
    )
  }

  render() {
    const {selection, graph, onSaveCaption, onSaveType, onDeleteArrowsProperty} = this.props
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
      fields.push(this.propertyTable(
        selection,
        properties
      ))
      fields.push(this.stylingSection(
        combineStyle(entities),
        selectionIncludes,
        this.props.onSaveArrowsPropertyValue,
        onDeleteArrowsProperty,
        graph.style
      ))
    }

    return (
      <React.Fragment>
        <p>
          {describeSelection(selection)}
        </p>
        <Form style={{'textAlign': 'left'}}>
          {fields}
        </Form>
      </React.Fragment>
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
      dispatch(renameProperty(selection, oldPropertyKey, newPropertyKey))
    },
    onSavePropertyValue: (selection, key, value) => {
      dispatch(setProperty(selection, key, value))
    },
    onSaveArrowsPropertyValue: (selection, key, value) => {
      dispatch(setArrowsProperty(selection, key, value))
    },
    onDeleteProperty: (selection, key) => {
      dispatch(removeProperty(selection, key))
    },
    onDeleteArrowsProperty: (selection, key) => {
      dispatch(removeArrowsProperty(selection, key))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailInspector)
