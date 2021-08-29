import React, {Component} from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'

export default class extends Component {

  componentDidMount() {
    this.props.setFocusHandler(() => this.inputElement && this.inputElement.focus())
  }

  render() {
    const {placeholder, onKeyPress, onChange} = this.props

    const handleKeyDown = (evt) => {
      if (evt.key === 'Enter' && evt.metaKey) {
        evt.target.blur()
      }
    }

    const imageInfo = this.props.cachedImages[this.props.value]

    const textBox = (
      <Input
        size='small'
        value={this.props.value}
        placeholder={placeholder}
        transparent
        style={{ 'width': '8em' }}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        ref={elm => this.inputElement = elm}
        onChange={evt => onChange(evt.target.value)}
      />
    )
    const message = (
      <p>
        Status: {(imageInfo || {}).status}
      </p>
    )
    return (
      <Form.Field>
        <Popup
          trigger={textBox}
          content={message}
          on='click'
          position='bottom center'
        />
      </Form.Field>
    );
  }
}