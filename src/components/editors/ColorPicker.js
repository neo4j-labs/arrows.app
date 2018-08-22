import React, {Component} from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'
import {CompactPicker} from 'react-color'

export default class extends Component {
  componentDidMount () {
    this.props.setFocusHandler(() => this.inputElement && this.inputElement.focus())
  }
  render() {
    const {value, onChange, onKeyPress} = this.props
    const textBox = (
      <Input
        size='small'
        value={value}
        style={{
          width: '8em',
          borderLeft: '17px solid ' + value,
          paddingLeft: '5px',
        }}
        transparent
        onKeyPress={onKeyPress}
        ref={elm => this.inputElement = elm}
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