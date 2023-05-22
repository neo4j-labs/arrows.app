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
    const popupContent = (
      <Form>
        <Form.Field>
          <Button
            key='convertCaptionsToLabels'
            onClick={onConvertCaptionsToLabels}
            basic
            color='black'
            size="tiny"
            content='Use as labels'
            type='button'
          />
        </Form.Field>
        <Form.Field>
          <Button
            key='convertCaptionsToProperties'
            onClick={onConvertCaptionsToPropertyValues}
            basic
            color='black'
            size="tiny"
            content='Use as properties'
            type='button'
          />
        </Form.Field>
      </Form>
    )

    return (
      <Form.Field key='_caption'>
        <label>Caption</label>
        <Popup
          trigger={textBox}
          content={popupContent}
          on='click'
          {...(value || value === undefined ? {} : {open: false})}
          position='bottom left'
        />
      </Form.Field>
    )
  }
}
