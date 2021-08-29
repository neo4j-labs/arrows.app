import React, {Component} from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'

export default class extends Component {

  constructor(props) {
    super(props)
    this.state = {
      numericValue: props.value,
      stringValue: props.value + ''
    }
  }

  componentDidMount() {
    this.props.setFocusHandler(() => this.inputElement && this.inputElement.focus())
  }

  render() {
    const {placeholder, onKeyPress} = this.props

    const handleKeyDown = (evt) => {
      if (evt.key === 'Enter' && evt.metaKey) {
        evt.target.blur()
      }
    }

    const textBox = (
      <Input
        size='small'
        value={this.state.stringValue}
        placeholder={placeholder}
        transparent
        style={{ 'width': '8em' }}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        ref={elm => this.inputElement = elm}
        onChange={evt => this.onChange(evt.target.value)}
      />
    )
    const message = (
      <p>
        Messages go here!
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