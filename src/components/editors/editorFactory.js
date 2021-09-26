import React from 'react'
import {Input} from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import Slider from './Slider'
import Dropdown from "./Dropdown";
import {styleAttributes, styleTypes} from "../../model/styling";
import ImageUrlInput from "./ImageUrlInput";

export const getStyleEditorComponent = (styleKey, value, placeholder, cachedImages, onChange, onKeyPress, setFocusHandler) => {
  const attribute = styleAttributes[styleKey]
  const styleType = styleTypes[attribute.type]

  switch (styleType.editor) {
    case 'slider':
      return (
        <Slider
          styleKey={styleKey}
          value={value}
          min={styleType.min}
          max={styleType.max}
          step={styleType.step}
          placeholder={placeholder}
          onChange={onChange}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    case 'colorPicker':
      return (
        <ColorPicker
          value={value}
          placeholder={placeholder}
          onChange={onChange}
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
          onChange={onChange}
        />
      )
    case 'imageUrl':
      return (
        <ImageUrlInput
          value={value}
          placeholder={placeholder}
          cachedImages={cachedImages}
          onChange={onChange}
          onKeyPress={onKeyPress}
          setFocusHandler={setFocusHandler}
        />
      )
    default:
      return (
        <Input
          fluid
          value={value}
          placeholder={placeholder}
          onChange={evt => onChange(evt.target.value)}
          onKeyPress={onKeyPress}
        />
      )
  }
}