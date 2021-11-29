import React, {Component} from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'
import {shrinkImageUrl} from "../../graphics/utils/resizeImage";
import {interpretClipboardData} from "../../actions/import";

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

    const onCopy = (event) => {
      event.clipboardData.setData('text/plain', this.props.value)
      event.preventDefault()
    }

    const onPaste = (event) => {
      const clipboardData = event.clipboardData
      interpretClipboardData(clipboardData, 0, {
        onPngImageUrl: (imageUrl) => {
          shrinkImageUrl(imageUrl, 1024 * 10).then(shrunkenImageUrl => {
            onChange(shrunkenImageUrl)
          })
        }
      })
    }

    const imageInfo = this.props.cachedImages[this.props.value]
    let displayValue = this.props.value
    if (displayValue && displayValue.length > 1000) {
      displayValue = displayValue.substring(0, 1000) + "…"
    }

    const textBox = (
      <Input
        size='small'
        value={displayValue}
        placeholder={placeholder}
        transparent
        style={{ 'width': '8em' }}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        ref={elm => this.inputElement = elm}
        onChange={evt => onChange(evt.target.value)}
        onCopy={onCopy}
        onPaste={onPaste}
      />
    )
    const message = imageInfo ? (
      <p>
        Status: {(imageInfo || {}).status}
      </p>
    ) : (
      <p>
        Paste a bitmap image from the clipboard, or type in the URL of an image (PNG or SVG).
        <br/>
        <code>https:</code> or <code>data:</code> URL schemes are supported.
        If the URL is hosted on the web, it needs to served with permissive CORS headers -
        generally it's easier to paste an image instead!
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