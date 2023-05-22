import React, { Component } from 'react'
import { Form, Button, Table, Message } from 'semantic-ui-react'
import { PropertyRow } from "./PropertyRow";

const objectToList = object => Object.keys(object)
  .map(key => ({
    key,
    value: object[key]
  }))

export default class PropertyTable extends Component {
  constructor(props) {
    super(props)
    this.focusHandlers = []
    this.state = {
      local: false,
      properties: null,
      error: null,
      lastValidKey: null,
      invalidIndex: null
    }
  }

  static propertyInput(property) {
    switch (property.status) {
      case 'CONSISTENT':
        return { valueFieldValue: property.value, valueFieldPlaceHolder: null }

      case 'INCONSISTENT':
        return { valueFieldValue: '', valueFieldPlaceHolder: '<multiple values>' }

      default:
        return { valueFieldValue: '', valueFieldPlaceHolder: '<partially present>' }
    }
  }

  render() {
    const { properties, propertySummary, onMergeOnValues, onSavePropertyKey, onSavePropertyValue, onDeleteProperty } = this.props
    const { properties: localProperties, local, error, lastValidKey, invalidIndex } = this.state
    let propertiesList

    if (local) {
      propertiesList = localProperties
    } else {
      propertiesList = objectToList(properties)
    }

    const addEmptyProperty = () => {
      onSavePropertyValue('', '')
    }

    const onNextProperty = (nextIndex) => {
      if (nextIndex === propertiesList.length) {
        addEmptyProperty()
      } else {
        this.focusHandlers[nextIndex]()
      }
    }

    const onPropertyKeyChange = (propertyKey, value, index) => {
      if(local) {
        if(!propertiesList.find(prop => prop.key === value)) {
          // switch to global
          onSavePropertyKey(lastValidKey, value)
          this.setState({
            local: false,
            error: null,
            properties: null,
            lastValidKey: null,
            invalidIndex: null
          })
        }
      } else {
        if(propertiesList.find(prop => prop.key === value)) {
          // switch to local
          propertiesList.find(prop => prop.key === propertyKey).key = value
          this.setState({
            local: true,
            error: "Duplicate properties found. Please rename the property.",
            properties: propertiesList,
            lastValidKey: propertyKey,
            invalidIndex: index
          })
        } else {
          onSavePropertyKey(propertyKey, value)
        }
      }
    }

    const rows = propertiesList.map((prop, index) => {
      const { valueFieldValue, valueFieldPlaceHolder } = PropertyTable.propertyInput(prop.value)
      return (
        <PropertyRow
          key={'row-' + index}
          propertyKey={prop.key}
          propertySummary={propertySummary}
          onMergeOnValues={() => onMergeOnValues(prop.key)}
          onKeyChange={newKey => onPropertyKeyChange(prop.key, newKey, index)}
          onValueChange={newValue => onSavePropertyValue(prop.key, newValue)}
          onDeleteProperty={() => onDeleteProperty(prop.key)}
          valueFieldValue={valueFieldValue}
          valueFieldPlaceHolder={valueFieldPlaceHolder}
          setFocusHandler={action => this.focusHandlers[index] = action}
          onNext={() => onNextProperty(index + 1)}
          keyDisabled={error && invalidIndex !== index}
          valueDisabled={error}
        />
      )
    })
    return (
      <Form.Field key='propertiesTable'>
        <label>Properties</label>
        <Table compact collapsing style={{ marginTop: 0 }}>
          <Table.Body>
            {rows}
          </Table.Body>
        </Table>
        {
          error ? <Message negative>{error}</Message> : null
        }
        <Button
          key='addProperty'
          onClick={addEmptyProperty}
          basic
          color='black'
          floated='right'
          size="tiny"
          icon="plus"
          content='Property'
          type='button'
          disabled={error}
        />
      </Form.Field>
    )
  }
}
