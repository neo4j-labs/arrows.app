import React, {Component} from 'react'
import {Form, Input} from 'semantic-ui-react'
import {connect} from "react-redux";
import {
  setProperty, setNodeCaption, setRelationshipType, renameProperty, removeProperty,
  setArrowsProperty, removeArrowsProperty
} from "../actions/graph";
import {commonValue} from "../model/values";
import {describeSelection, selectedNodes, selectedRelationships} from "../model/selection";
import {combineProperties, combineStyle} from "../model/properties";
import PropertyTable from "./PropertyTable";
import StyleTable from "./StyleTable";

class DetailInspector extends Component {
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
