import React, {Component} from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'

export default class extends Component {
  componentDidMount () {
    this.props.setFocusHandler(() => this.inputElement && this.inputElement.focus())
  }
  render() {
    const {value, placeholder, onChange, min, max, step, onKeyPress} = this.props

    const handleKeyDown = (evt) => {
      if (evt.key === 'Enter' && evt.metaKey) {
        evt.target.blur()
      }
    }

    const sizeToSlide = (size) => {
      return Math.round(100 * (Math.log(size + 1) - Math.log(min + 1)) / (Math.log(max + 1) - Math.log(min + 1)))
    }

    const slideToSize = (slide) => {
      const rawSize = Math.exp(slide * (Math.log(max + 1) - Math.log(min + 1)) / 100 + Math.log(min + 1)) - 1
      return rawSize > step ? Math.round(rawSize / step) * step: Math.round(rawSize)
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
        min={0}
        max={100}
        step={1}
        value={sizeToSlide(value)}
        style={{ 'width': '10em' }}
        onChange={evt => onChange(slideToSize(Number(evt.target.value)))}
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