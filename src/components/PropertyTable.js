import React, {Component} from 'react'
import { Form, Button, Table } from 'semantic-ui-react'
import {PropertyRow} from "./PropertyRow";

export default class PropertyTable extends Component {
  constructor (props) {
    super(props)
    this.focusHandlers = []
  }

  static propertyInput(property) {
    switch (property.status) {
      case 'CONSISTENT':
        return {valueFieldValue: property.value, valueFieldPlaceHolder: null}

      case 'INCONSISTENT':
        return {valueFieldValue: '', valueFieldPlaceHolder: '<multiple values>'}

      default:
        return {valueFieldValue: '', valueFieldPlaceHolder: '<partially present>'}
    }
  }

  render() {
    const { properties, onSavePropertyKey, onSavePropertyValue, onDeleteProperty } = this.props
    const propertiesList = Object.keys(properties)
    const addEmptyProperty = () =>  {
      onSavePropertyValue('', '')
    }

    const onNextProperty = (nextIndex) => {
      if (nextIndex === propertiesList.length) {
        addEmptyProperty()
      } else {
        this.focusHandlers[nextIndex]()
      }
    }

    const rows = propertiesList.map((propertyKey, index) => {
      const {valueFieldValue, valueFieldPlaceHolder} = PropertyTable.propertyInput(properties[propertyKey])
      return (
        <PropertyRow
          key={'row-' + index}
          propertyKey={propertyKey}
          onKeyChange={(event) => onSavePropertyKey(propertyKey, event.target.value)}
          onValueChange={(event) => onSavePropertyValue(propertyKey, event.target.value)}
          onDeleteProperty={(event) => onDeleteProperty(propertyKey)}
          valueFieldValue={valueFieldValue}
          valueFieldPlaceHolder={valueFieldPlaceHolder}
          setFocusHandler={action => this.focusHandlers[index] = action}
          onNext={() => onNextProperty(index + 1)}
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
          onClick={addEmptyProperty}
          basic
          floated='right'
          size="tiny"
          icon="plus"
          content='Property'
          type='button'
        />
      </Form.Field>
    )
  }
}