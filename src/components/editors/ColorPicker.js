import React, {Component} from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'
import { CompactPicker } from 'react-color'

export default class extends Component {
  render () {
    const { value, onChange } = this.props
    const textBox = (
      <Input
        size='small'
        value={value}
        style={{ 'width': '5em', background: value, borderTopLeftRadius: '0.286em', borderBottomLeftRadius: '0.286em', paddingLeft: '0.5em' }}
        transparent
        onChange={evt => onChange(evt.target.value)}
      />
    )
    const picker = (
      <CompactPicker
        color={value}
        onChangeComplete={color => {
          onChange(color.hex)
        }}
      />
    )
    return (
      <Form.Field>
        <Popup
          trigger={textBox}
          content={picker}
          on='click'
          position='bottom center'
        />
      </Form.Field>
    );
  }
}