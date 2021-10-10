import {defaultFontSize, defaultNodeRadius} from "../graphics/constants";
import {black, white} from "./colors";
import {getStyleSelector} from "../selectors/style";

const hasIcon = (node, style) => !!style('node-icon-image') || !!style('relationship-icon-image')
const hasCaption = (node) => node.caption && node.caption.length > 0
const hasLabels = (node) => node.labels && node.labels.length > 0
const hasType = (relationship) => relationship.type && relationship.type.length > 0
const hasProperty = (entity) => entity.properties && Object.keys(entity.properties).length > 0;

const styleFilters = {
  'Node': {
    relevantToNode: () => true
  },
  'NodeWithBorder': {
    relevantToNode: (node, style) => style('border-width') > 0
  },
  'NodeWithInsideDetail': {
    relevantToNode: (node, style) => (
      hasIcon(node, style) && style('icon-position') === 'inside' ||
      hasCaption(node) && style('caption-position') === 'inside' ||
      hasLabels(node) && style('label-position') === 'inside' ||
      hasProperty(node) && style('property-position') === 'inside'
    )
  },
  'NodeWithOutsideDetail': {
    relevantToNode: (node, style) => (
      hasIcon(node, style) && style('icon-position') === 'outside' ||
      hasCaption(node) && style('caption-position') === 'outside' ||
      hasLabels(node) && style('label-position') === 'outside' ||
      hasProperty(node) && style('property-position') === 'outside'
    )
  },
  'NodeWithIcon': {
    relevantToNode: hasIcon
  },
  'NodeOrRelationshipWithIcon': {
    relevantToNode: hasIcon,
    relevantToRelationship: hasIcon
  },
  'NodeWithCaption': {
    relevantToNode: hasCaption
  },
  'NodeWithCaptionOutside': {
    relevantToNode: (node, style) => (
      hasCaption(node) && style('caption-position') === 'outside'
    )
  },
  'NodeWithLabel': {
    relevantToNode: hasLabels
  },
  'Relationship': {
    relevantToRelationship: () => true
  },
  'RelationshipWithDetail': {
    relevantToRelationship: (relationship) => (
      hasType(relationship) || hasProperty(relationship)
    )
  },
  'RelationshipWithType': {
    relevantToRelationship: hasType
  },
  'NodeOrRelationshipWithProperty': {
    relevantToNode: hasProperty,
    relevantToRelationship: hasProperty
  }
}

export const categoriesPresent = (nodes, relationships, graph) => {
  const categories = []
  nodes.forEach(node => {
    const style = styleAttribute => getStyleSelector(node, styleAttribute)(graph)
    for (const [category, filter] of Object.entries(styleFilters)) {
      if (filter.relevantToNode && filter.relevantToNode(node, style)) {
        categories.push(category)
      }
    }
  })
  relationships.forEach(relationship => {
    const style = styleAttribute => getStyleSelector(relationship, styleAttribute)(graph)
    for (const [category, filter] of Object.entries(styleFilters)) {
      if (filter.relevantToRelationship && filter.relevantToRelationship(relationship, style)) {
        categories.push(category)
      }
    }
  })
  return categories
}

export const styleAttributeGroups = [
  {
    name: 'Nodes', entityTypes: ['node'], attributes: [
      {key: 'node-color', appliesTo: 'Node', type: 'color', defaultValue: white},
      {key: 'border-width', appliesTo: 'Node', type: 'line-width', defaultValue: 4},
      {key: 'border-color', appliesTo: 'NodeWithBorder', type: 'color', defaultValue: black},
      {key: 'radius', appliesTo: 'Node', type: 'radius', defaultValue: defaultNodeRadius},
      {key: 'node-padding', appliesTo: 'NodeWithInsideDetail', type: 'spacing', defaultValue: 5},
      {key: 'node-margin', appliesTo: 'NodeWithOutsideDetail', type: 'spacing', defaultValue: 2},
      {key: 'outside-position', appliesTo: 'NodeWithOutsideDetail', type: 'outside-position', defaultValue: 'auto'},
      {key: 'node-icon-image', appliesTo: 'Node', type: 'image', defaultValue: ''},
      {key: 'node-background-image', appliesTo: 'Node', type: 'image', defaultValue: ''},
    ]
  },
  {
    name: 'Icons', entityTypes: ['node'], attributes: [
      {key: 'icon-position', appliesTo: 'NodeWithIcon', type: 'inside-outside', defaultValue: 'inside' },
      {key: 'icon-size', appliesTo: 'NodeOrRelationshipWithIcon', type: 'radius', defaultValue: 64 }
    ]
  },
  {
    name: 'Node Captions', entityTypes: ['node'], attributes: [
      {key: 'caption-position', appliesTo: 'NodeWithCaption', type: 'inside-outside', defaultValue: 'inside'},
      {key: 'caption-max-width', appliesTo: 'NodeWithCaptionOutside', type: 'radius', defaultValue: 200},
      {key: 'caption-color', appliesTo: 'NodeWithCaption', type: 'color', defaultValue: black},
      {key: 'caption-font-size', appliesTo: 'NodeWithCaption', type: 'font-size', defaultValue: defaultFontSize},
      {key: 'caption-font-weight', appliesTo: 'NodeWithCaption', type: 'font-weight', defaultValue: 'normal'},
    ]
  },
  {
    name: 'Node Labels', entityTypes: ['node'], attributes: [
      {key: 'label-position', appliesTo: 'NodeWithLabel', type: 'inside-outside', defaultValue: 'inside'},
      {key: 'label-display', appliesTo: 'NodeWithLabel', type: 'label-display', defaultValue: 'pill'},
      {key: 'label-color', appliesTo: 'NodeWithLabel', type: 'color', defaultValue: black},
      {key: 'label-background-color', appliesTo: 'NodeWithLabel', type: 'color', defaultValue: white},
      {key: 'label-border-color', appliesTo: 'NodeWithLabel', type: 'color', defaultValue: black},
      {key: 'label-border-width', appliesTo: 'NodeWithLabel', type: 'line-width', defaultValue: 4},
      {key: 'label-font-size', appliesTo: 'NodeWithLabel', type: 'font-size', defaultValue: defaultFontSize * (4/5)},
      {key: 'label-padding', appliesTo: 'NodeWithLabel', type: 'spacing', defaultValue: 5},
      {key: 'label-margin', appliesTo: 'NodeWithLabel', type: 'spacing', defaultValue: 4},
    ]
  },
  {
    name: 'Arrows', entityTypes: ['relationship'], attributes: [
      {key: 'directionality', appliesTo: 'Relationship', type: 'directionality', defaultValue: 'directed'},
      {key: 'detail-position', appliesTo: 'RelationshipWithDetail', type: 'detail-position', defaultValue: 'inline'},
      {key: 'detail-orientation', appliesTo: 'RelationshipWithDetail', type: 'orientation', defaultValue: 'parallel'},
      {key: 'arrow-width', appliesTo: 'Relationship', type: 'line-width', defaultValue: 5},
      {key: 'arrow-color', appliesTo: 'Relationship', type: 'color', defaultValue: black},
      {key: 'margin-start', appliesTo: 'Relationship', type: 'spacing', defaultValue: 5},
      {key: 'margin-end', appliesTo: 'Relationship', type: 'spacing', defaultValue: 5},
      {key: 'margin-peer', appliesTo: 'Relationship', type: 'spacing', defaultValue: 20},
      {key: 'attachment-start', appliesTo: 'Relationship', type: 'attachment', defaultValue: 'normal'},
      {key: 'attachment-end', appliesTo: 'Relationship', type: 'attachment', defaultValue: 'normal'},
      {key: 'relationship-icon-image', appliesTo: 'Relationship', type: 'image', defaultValue: ''}
    ]
  },
  {
    name: 'Relationship Types', entityTypes: ['relationship'], attributes: [
      {key: 'type-color', appliesTo: 'RelationshipWithType', type: 'color', defaultValue: black},
      {key: 'type-background-color', appliesTo: 'RelationshipWithType', type: 'color', defaultValue: white},
      {key: 'type-border-color', appliesTo: 'RelationshipWithType', type: 'color', defaultValue: black},
      {key: 'type-border-width', appliesTo: 'RelationshipWithType', type: 'line-width', defaultValue: 0},
      {key: 'type-font-size', appliesTo: 'RelationshipWithType', type: 'font-size', defaultValue: 16},
      {key: 'type-padding', appliesTo: 'RelationshipWithType', type: 'spacing', defaultValue: 5}
    ]
  },
  {
    name: 'Properties', entityTypes: ['node', 'relationship'], attributes: [
      {key: 'property-position', appliesTo: 'NodeOrRelationshipWithProperty', type: 'inside-outside', defaultValue: 'outside'},
      {key: 'property-alignment', appliesTo: 'NodeOrRelationshipWithProperty', type: 'property-alignment', defaultValue: 'colon'},
      {key: 'property-color', appliesTo: 'NodeOrRelationshipWithProperty', type: 'color', defaultValue: black},
      {key: 'property-font-size', appliesTo: 'NodeOrRelationshipWithProperty', type: 'font-size', defaultValue: 16},
      {key: 'property-font-weight', appliesTo: 'NodeOrRelationshipWithProperty', type: 'font-weight', defaultValue: 'normal'},
    ]
  }
]

export const styleAttributes = Object.fromEntries(
  styleAttributeGroups.flatMap(group => group.attributes)
    .map(attribute => [attribute.key, attribute]))

export const nodeStyleAttributes = styleAttributeGroups
  .filter(group => group.entityTypes.includes('node'))
  .flatMap(group => group.attributes)
  .map(attribute => attribute.key)

export const relationshipStyleAttributes = styleAttributeGroups
  .filter(group => group.entityTypes.includes('relationship'))
  .flatMap(group => group.attributes)
  .map(attribute => attribute.key)

export const imageAttributes = styleAttributeGroups
  .flatMap(group => group.attributes)
  .filter(attribute => attribute.type === 'image')
  .map(attribute => attribute.key)

export const styleTypes = {
  'radius': { editor: 'slider', min: 1, max: 1000, step: 5 },
  'line-width': {  editor: 'slider', min: 0, max: 25, step: 1 },
  'spacing': {  editor: 'slider', min: 0, max: 50, step: 1 },
  'font-size': {  editor: 'slider', min: 5, max: 100, step: 1 },
  'color': { editor: 'colorPicker' },
  'font-weight': { editor: 'dropdown', options: ['normal', 'bold'] },
  'directionality': { editor: 'dropdown', options: ['directed', 'undirected'] },
  'outside-position': { editor: 'dropdown', options: ['auto', 'top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'] },
  'inside-outside': { editor: 'dropdown', options: ['inside', 'outside'] },
  'detail-position': { editor: 'dropdown', options: ['inline', 'above', 'below'] },
  'orientation': { editor: 'dropdown', options: ['parallel', 'perpendicular', 'horizontal'] },
  'property-alignment': { editor: 'dropdown', options: ['colon', 'center'] },
  'label-display': { editor: 'dropdown', options: ['pill', 'bare'] },
  'attachment': { editor: 'dropdown', options: ['normal', 'top', 'right', 'bottom', 'left'] },
  'image': { editor: 'imageUrl' }
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

    case "imageUrl":
      return value
  }
  return styleAttribute.defaultValue
}
