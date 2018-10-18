import React from 'react'
import {Input} from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import Slider from './Slider'

export const getEditorComponent = ({ value, type='string', onChange, onKeyPress, setFocusHandler }) => {
  switch (type) {
    case 'size':
      return (
        <Slider
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    case 'color':
      return (
        <ColorPicker
          value={value}
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
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      )
  }
}

export const getStyleEditorComponent = (styleKey, value, onChange, onKeyPress, setFocusHandler) => {
  switch (styleKey) {
    case 'radius':
      return getEditorComponent({ value, type:'size', onChange, onKeyPress, setFocusHandler })
    case 'node-color':
      return getEditorComponent({ value, type:'color', onChange, onKeyPress, setFocusHandler })
    case 'border-width':
      return getEditorComponent({ value, type:'size', onChange, onKeyPress, setFocusHandler })
    case 'border-color':
      return getEditorComponent({ value, type:'color', onChange, onKeyPress, setFocusHandler })
    case 'caption-color':
      return getEditorComponent({ value, type:'color', onChange, onKeyPress, setFocusHandler })
    case 'caption-font-size':
      return getEditorComponent({ value, type:'size', onChange, onKeyPress, setFocusHandler })
    case 'property-color':
      return getEditorComponent({ value, type:'color', onChange, onKeyPress, setFocusHandler })
    case 'property-font-size':
      return getEditorComponent({ value, type:'size', onChange, onKeyPress, setFocusHandler })
    case 'arrow-width':
      return getEditorComponent({ value, type:'size', onChange, onKeyPress, setFocusHandler })
    case 'arrow-color':
      return getEditorComponent({ value, type:'color', onChange, onKeyPress, setFocusHandler })
    default:
      return getEditorComponent({ value, onChange, onKeyPress, setFocusHandler })
  }
}