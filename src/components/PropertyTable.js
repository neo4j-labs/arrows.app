import React, {Component} from 'react'
import { Form, Button, Table } from 'semantic-ui-react'
import {PropertyRow} from "./PropertyRow";

export default class PropertyTable extends Component {

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

    const rows = Object.keys(properties).map((propertyKey, index) => {
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
          onClick={(event) => onSavePropertyValue('', '')}
          basic
          floated='right'
          size="tiny"
          icon="plus"
          content='Property'
        />
      </Form.Field>
    )
  }
}