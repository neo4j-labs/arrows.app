import React, {Component} from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'

export default class extends Component {
  componentDidMount () {
    this.props.setFocusHandler(() => this.inputElement && this.inputElement.focus())
  }
  render() {
    const {value, placeholder, onChange, min = 0, max = 100, step = 5, onKeyPress} = this.props

    const handleKeyDown = (evt) => {
      if (evt.key === 'Enter' && evt.metaKey) {
        evt.target.blur()
      }
    }

    const textBox = (
      <Input
        size='small'
        value={value}
        placeholder={placeholder}
        transparent
        style={{ 'width': '8em' }}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        ref={elm => this.inputElement = elm}
        onChange={evt => onChange(Number(evt.target.value))}
      />
    )
    const slider = (
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ 'width': '10em' }}
        onChange={evt => onChange(Number(evt.target.value))}
      />
    )
    return (
      <Form.Field>
        <Popup
          trigger={textBox}
          content={slider}
          on='click'
          position='bottom center'
        />
      </Form.Field>
    );
  }
}