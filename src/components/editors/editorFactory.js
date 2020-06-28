import React from 'react'
import {Input} from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import Slider from './Slider'
import Dropdown from "./Dropdown";
import {styleAttributes, styleTypes, validate} from "../../model/styling";

export const getStyleEditorComponent = (styleKey, value, placeholder, onChange, onKeyPress, setFocusHandler) => {
  const attribute = styleAttributes[styleKey]
  const styleType = styleTypes[attribute.type]
  const onChangeWithValidation = (value) => {
    if (validate(styleKey, value) === value) {
      onChange(value)
    }
  }

  switch (styleType.editor) {
    case 'slider':
      return (
        <Slider
          value={value}
          min={styleType.min}
          max={styleType.max}
          step={styleType.step}
          placeholder={placeholder}
          onChange={onChangeWithValidation}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    case 'colorPicker':
      return (
        <ColorPicker
          value={value}
          placeholder={placeholder}
          onChange={onChangeWithValidation}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    case 'dropdown':
      return (
        <Dropdown
          value={value}
          placeholder={placeholder}
          options={styleType.options}
          onChange={onChangeWithValidation}
        />
      )
    default:
      return (
        <Input
          fluid
          value={value}
          placeholder={placeholder}
          onChange={onChangeWithValidation}
          onKeyPress={onKeyPress}
        />
      )
  }
}