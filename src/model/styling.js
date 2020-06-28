import {defaultFontSize, defaultNodeRadius} from "../graphics/constants";
import {black, white} from "./colors";

export const styleGroups = {
  'Node': {
    relevantTo: (nodes, relationships) => nodes.length > 0
  },
  'Caption': {
    relevantTo: (nodes, relationships) =>
      nodes.some(node => node.caption && node.caption.length > 0)
  },
  'Label': {
    relevantTo: (nodes, relationships) =>
      nodes.some(node => node.labels && node.labels.length > 0)
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
  'node-color': {appliesTo: 'Node', type: 'color', defaultValue: white},
  'node-padding': {appliesTo: 'Node', type: 'spacing', defaultValue: 5},
  'border-width': {appliesTo: 'Node', type: 'line-width', defaultValue: 4},
  'border-color': {appliesTo: 'Node', type: 'color', defaultValue: black},
  'caption-position': {appliesTo: 'Caption', type: 'caption-position', defaultValue: 'inside'},
  'caption-color': {appliesTo: 'Caption', type: 'color', defaultValue: black},
  'caption-font-size': {appliesTo: 'Caption', type: 'font-size', defaultValue: defaultFontSize},
  'caption-font-weight': {appliesTo: 'Caption', type: 'font-weight', defaultValue: 'normal'},
  'caption-max-width': {appliesTo: 'Caption', type: 'radius', defaultValue: 200},
  'label-position': {appliesTo: 'Label', type: 'label-position', defaultValue: 'inside'},
  'label-color': {appliesTo: 'Label', type: 'color', defaultValue: black},
  'label-background-color': {appliesTo: 'Label', type: 'color', defaultValue: white},
  'label-border-color': {appliesTo: 'Label', type: 'color', defaultValue: black},
  'label-border-width': {appliesTo: 'Label', type: 'line-width', defaultValue: 4},
  'label-font-size': {appliesTo: 'Label', type: 'font-size', defaultValue: defaultFontSize * (4/5)},
  'label-padding': {appliesTo: 'Label', type: 'spacing', defaultValue: 5},
  'label-margin': {appliesTo: 'Label', type: 'spacing', defaultValue: 4},
  'property-color': {appliesTo: 'Property', type: 'color', defaultValue: black},
  'property-font-size': {appliesTo: 'Property', type: 'font-size', defaultValue: defaultFontSize * (4/5)},
  'property-font-weight': {appliesTo: 'Property', type: 'font-weight', defaultValue: 'normal'},
  'property-orientation': {appliesTo: 'Relationship', type: 'orientation', defaultValue: 'parallel'},
  'property-position': {appliesTo: 'Node', type: 'property-position', defaultValue: 'outside-stalk'},
  'arrow-width': {appliesTo: 'Relationship', type: 'line-width', defaultValue: 5},
  'arrow-color': {appliesTo: 'Relationship', type: 'color', defaultValue: black},
  'type-position': {appliesTo: 'Relationship', type: 'type-position', defaultValue: 'inline'},
  'type-orientation': {appliesTo: 'Relationship', type: 'orientation', defaultValue: 'parallel'},
  'type-font-size': {appliesTo: 'Relationship', type: 'font-size', defaultValue: defaultFontSize * (4/5)},
  'type-color': {appliesTo: 'Relationship', type: 'color', defaultValue: black},
  'type-background-color': {appliesTo: 'Relationship', type: 'color', defaultValue: white},
  'type-border-width': {appliesTo: 'Relationship', type: 'line-width', defaultValue: 0},
  'type-border-color': {appliesTo: 'Relationship', type: 'color', defaultValue: black},
  'type-padding': {appliesTo: 'Relationship', type: 'spacing', defaultValue: 5},
  'margin-start': {appliesTo: 'Relationship', type: 'spacing', defaultValue: 5},
  'margin-end': {appliesTo: 'Relationship', type: 'spacing', defaultValue: 5},
  'margin-peer': {appliesTo: 'Relationship', type: 'spacing', defaultValue: 20},
  'attachment-start': {appliesTo: 'Relationship', type: 'attachment', defaultValue: 'normal'},
  'attachment-end': {appliesTo: 'Relationship', type: 'attachment', defaultValue: 'normal'}
}

export const nodeStyleAttributes = Object.keys(styleAttributes).filter(key => {
  return ['Node', 'Caption', 'Label', 'Property'].includes(styleAttributes[key].appliesTo)
})

export const relationshipStyleAttributes = Object.keys(styleAttributes).filter(key => {
  return ['Relationship', 'Property'].includes(styleAttributes[key].appliesTo)
})

export const styleTypes = {
  'radius': { editor: 'slider', min: 1, max: 1000, step: 5 },
  'line-width': {  editor: 'slider', min: 0, max: 25, step: 1 },
  'spacing': {  editor: 'slider', min: 0, max: 50, step: 1 },
  'font-size': {  editor: 'slider', min: 5, max: 100, step: 1 },
  'color': { editor: 'colorPicker' },
  'font-weight': { editor: 'dropdown', options: ['normal', 'bold'] },
  'caption-position': { editor: 'dropdown', options: ['inside', 'top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'] },
  'label-position': { editor: 'dropdown', options: ['inside', 'outside'] },
  'property-position': { editor: 'dropdown', options: ['inside', 'outside-stalk'] },
  'type-position': { editor: 'dropdown', options: ['inline', 'above', 'below'] },
  'orientation': { editor: 'dropdown', options: ['parallel', 'perpendicular', 'horizontal'] },
  'attachment': { editor: 'dropdown', options: ['normal', 'top', 'right', 'bottom', 'left'] }
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

export const validate = (styleKey, value) => {
  const styleAttribute = styleAttributes[styleKey]
  const styleType = styleTypes[styleAttribute.type]
  switch (styleType.editor) {
    case 'slider':
      if (!isNaN(value)) {
        if (value < styleType.min) {
          return styleType.min
        }
        if (value > styleType.max) {
          return styleType.max
        }
        return value
      }
      break

    case "colorPicker":
      if (/^#[0-9A-F]{6}$/i.test(value)) {
        return value
      }
      break

    case "dropdown":
      if (styleType.options.includes(value)) {
        return value
      }
      break
  }
  return styleAttribute.defaultValue
}
