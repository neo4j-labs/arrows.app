import React from 'react'
import {Input} from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import Slider from './Slider'

export const getEditorComponent = ({ value, type='string', onChange }) => {
  switch (type) {
    case 'size':
      return (
        <Slider
          value={value}
          onChange={onChange}
        />
      )
    case 'color':
      return (
        <ColorPicker
          value={value}
          onChange={onChange}
        />
      )
    case 'string':
    default:
      return (
        <Input
          fluid
          value={value}
          onChange={onChange}
        />
      )
  }
}

export const getStyleEditorComponent = (styleKey, value, onChange) => {
  switch (styleKey) {
    case 'radius':
      return getEditorComponent({ value, type:'size', onChange })
    case 'node-color':
      return getEditorComponent({ value, type:'color', onChange })
    case 'border-width':
      return getEditorComponent({ value, type:'size', onChange })
    case 'border-color':
      return getEditorComponent({ value, type:'color', onChange })
    case 'caption-color':
      return getEditorComponent({ value, type:'color', onChange })
    case 'caption-font-size':
      return getEditorComponent({ value, type:'size', onChange })
    case 'property-color':
      return getEditorComponent({ value, type:'color', onChange })
    case 'property-font-size':
      return getEditorComponent({ value, type:'size', onChange })
    case 'arrow-width':
      return getEditorComponent({ value, type:'size', onChange })
    default:
      return getEditorComponent({ value, onChange })
  }
}