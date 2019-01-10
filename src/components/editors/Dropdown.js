import React, {Component} from 'react'
import {Form, Dropdown} from 'semantic-ui-react'

export default class extends Component {

  render() {
    const { value, onChange } = this.props

    const options = ['normal', 'bold'].map(value => ({
      text: value,
      value
    }))
    const trigger = (
      <span>{value}</span>
    )
    return (
      <Form.Field>
        <Dropdown
          trigger={trigger}
          options={options}
          defaultValue={value}
          onChange={(e, { value }) => onChange(value)}
        />
      </Form.Field>
    )
  }
}