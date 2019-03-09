import {defaultFontSize, defaultNodeRadius} from "../graphics/constants";
import {black, white, blueActive} from "./colors";

export const styleGroups = {
  'Node': {
    relevantTo: (nodes, relationships) => nodes.length > 0
  },
  'Caption': {
    relevantTo: (nodes, relationships) =>
      nodes.some(node => node.caption && node.caption.length > 0)
  },
  'Relationship': {
    relevantTo: (nodes, relationships) => relationships.length > 0
  },
  'Property': {
    relevantTo: (nodes, relationships) =>
      [...nodes, ...relationships].some(entity => entity.properties && Object.keys(entity.properties).length > 0)
  },
}

export const styleAttributes = {
  'radius': {appliesTo: 'Node', type: 'radius', defaultValue: defaultNodeRadius},
  'node-color': {appliesTo: 'Node', type: 'color', defaultValue: blueActive},
  'border-width': {appliesTo: 'Node', type: 'line-width', defaultValue: 0},
  'border-color': {appliesTo: 'Node', type: 'color', defaultValue: black},
  'caption-color': {appliesTo: 'Caption', type: 'color', defaultValue: white},
  'caption-font-size': {appliesTo: 'Caption', type: 'font-size', defaultValue: defaultFontSize},
  'caption-font-weight': {appliesTo: 'Caption', type: 'font-weight', defaultValue: 'normal'},
  'property-color': {appliesTo: 'Property', type: 'color', defaultValue: black},
  'property-font-size': {appliesTo: 'Property', type: 'font-size', defaultValue: defaultFontSize * (4/5)},
  'arrow-width': {appliesTo: 'Relationship', type: 'line-width', defaultValue: 1},
  'arrow-color': {appliesTo: 'Relationship', type: 'color', defaultValue: black}
}

export const nodeStyleAttributes = Object.keys(styleAttributes).filter(key => {
  return styleAttributes[key].appliesTo === 'Node'
})

export const relationshipStyleAttributes = Object.keys(styleAttributes).filter(key => {
  return styleAttributes[key].appliesTo === 'Relationship'
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