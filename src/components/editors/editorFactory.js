import React from 'react'
import {Input} from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import Slider from './Slider'
import Dropdown from "./Dropdown";

export const getStyleEditorComponent = (styleKey, value, placeholder, onChange, onKeyPress, setFocusHandler) => {
  switch (styleKey) {
    case 'radius':
    case 'border-width':
    case 'caption-font-size':
    case 'property-font-size':
    case 'arrow-width':
      return (
        <Slider
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    case 'node-color':
    case 'border-color':
    case 'caption-color':
    case 'property-color':
    case 'arrow-color':
      return (
        <ColorPicker
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    case 'caption-font-weight':
      return (
        <Dropdown
          value={value}
          onChange={onChange}
        />
      )
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