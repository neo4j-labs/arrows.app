import React, {Component} from 'react'
import {Button, Form, Input, Popup} from "semantic-ui-react";

export class CaptionInspector extends Component {
  render() {
    const { value, onSaveCaption, onConvertCaptionsToLabels, onConvertCaptionsToPropertyValues } = this.props

    const fieldValue = value || ''
    const placeholder = value === undefined ? '<multiple values>' : null

    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape' || (evt.key === 'Enter' && evt.metaKey)) {
        this.captionInput.inputRef && this.captionInput.inputRef.blur()
      }
    }

    const textBox = (
      <Input value={fieldValue}
             onFocus={this.moveCursorToEnd}
             onChange={(event) => onSaveCaption(event.target.value)}
             placeholder={placeholder}
             ref={elm => this.captionInput = elm}
             onKeyDown={handleKeyDown.bind(this)}/>
    )
    const buttons = (
      <div>
        <Button
          key='convertCaptionsToLabels'
          onClick={onConvertCaptionsToLabels}
          basic
          color='black'
          floated='right'
          size="tiny"
          content='Use captions as labels'
          type='button'
        />
        <Button
          key='convertCaptionsToProperties'
          onClick={onConvertCaptionsToPropertyValues}
          basic
          color='black'
          floated='right'
          size="tiny"
          content='Use captions as properties'
          type='button'
        />
      </div>
    )

    return (
      <Form.Field key='_caption'>
        <label>Caption</label>
        <Popup
          trigger={textBox}
          content={buttons}
          on='click'
          position='bottom center'
        />
      </Form.Field>
    )
  }
}