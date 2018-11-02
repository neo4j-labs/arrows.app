import React from 'react'
import {Input} from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import Slider from './Slider'

export const getEditorComponent = ({ value, placeholder, type='string', onChange, onKeyPress, setFocusHandler }) => {
  switch (type) {
    case 'size':
      return (
        <Slider
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    case 'color':
      return (
        <ColorPicker
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    case 'string':
    default:
      return (
        <Input
          fluid
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      )
  }
}

export const getStyleEditorComponent = (styleKey, value, placeholder, onChange, onKeyPress, setFocusHandler) => {
  switch (styleKey) {
    case 'radius':
    case 'border-width':
    case 'caption-font-size':
    case 'property-font-size':
    case 'arrow-width':
      return getEditorComponent({ value, placeholder, type:'size', onChange, onKeyPress, setFocusHandler })
    case 'node-color':
    case 'border-color':
    case 'caption-color':
    case 'property-color':
    case 'arrow-color':
      return getEditorComponent({ value, placeholder, type:'color', onChange, onKeyPress, setFocusHandler })
    default:
      return getEditorComponent({ value, placeholder, onChange, onKeyPress, setFocusHandler })
  }
}