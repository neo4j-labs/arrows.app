import {defaultFontSize, defaultNodeRadius} from "../graphics/constants";
import {black, white, blueActive} from "./colors";

export const styleAttributes = {
  'radius': {appliesTo: 'node', type: 'radius', defaultValue: defaultNodeRadius},
  'node-color': {appliesTo: 'node', type: 'color', defaultValue: blueActive},
  'border-width': {appliesTo: 'node', type: 'line-width', defaultValue: 0},
  'border-color': {appliesTo: 'node', type: 'color', defaultValue: black},
  'caption-color': {appliesTo: 'node', type: 'color', defaultValue: white},
  'caption-font-size': {appliesTo: 'node', type: 'font-size', defaultValue: defaultFontSize},
  'caption-font-weight': {appliesTo: 'node', type: 'font-weight', defaultValue: 'normal'},
  'property-color': {appliesTo: 'node', type: 'color', defaultValue: black},
  'property-font-size': {appliesTo: 'node', type: 'font-size', defaultValue: defaultFontSize * (4/5)},
  'arrow-width': {appliesTo: 'relationship', type: 'line-width', defaultValue: 1},
  'arrow-color': {appliesTo: 'relationship', type: 'color', defaultValue: black}
}

export const nodeStyleAttributes = Object.keys(styleAttributes).filter(key => {
  return styleAttributes[key].appliesTo === 'node'
})

export const relationshipStyleAttributes = Object.keys(styleAttributes).filter(key => {
  return styleAttributes[key].appliesTo === 'relationship'
})

export const styleTypes = {
  'radius': { editor: 'slider', min: 1, max: 1000, step: 5 },
  'line-width': {  editor: 'slider', min: 0, max: 25, step: 1 },
  'font-size': {  editor: 'slider', min: 5, max: 100, step: 1 },
  'color': { editor: 'colorPicker' },
  'font-weight': { editor: 'dropdown', options: ['normal', 'bold'] }
}

export const completeWithDefaults = (style) => {
  const completeStyle = {}
  Object.keys(styleAttributes).forEach(key => {
    if (style.hasOwnProperty(key)) {
      completeStyle[key] = style[key]
    } else {
      completeStyle[key] = styleAttributes[key].defaultValue
    }
  })
  return completeStyle
}