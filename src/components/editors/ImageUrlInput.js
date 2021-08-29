import React, {Component} from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'

export default class extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: props.value
    }
  }

  componentDidMount() {
    this.props.setFocusHandler(() => this.inputElement && this.inputElement.focus())
  }

  onChange(value) {
    this.setState({ value })
    this.props.onChange(value)
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
        value={this.state.value}
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