import { createSelector } from 'reselect';
import { defaultFontSize, defaultNodeRadius } from './constants'; // ABK moved from 'graphics' package
import { black, white } from './colors';
// import {getStyleSelector} from "../selectors/style"; // ABK now defined here
import { googleFonts } from './fonts';
import { Graph } from './Graph';
import { Node } from './Node';
import { Relationship } from './Relationship';
import { Entity } from './Id';

export type StyleFunction = (s: string) => string | number;

const hasIcon = (node: Entity, style: StyleFunction) =>
  !!style('node-icon-image') || !!style('relationship-icon-image');
const hasCaption = (node: Node) => node.caption && node.caption.length > 0;
const hasType = (relationship: Relationship) =>
  relationship.type && relationship.type.length > 0;
const hasProperty = (entity: Entity) =>
  entity.properties && Object.keys(entity.properties).length > 0;

export type Style = Record<string, unknown>;

const styleFilters = {
  Node: {
    relevantToNode: () => true,
  },
  NodeWithBorder: {
    relevantToNode: (node: Node, style: StyleFunction) =>
      (style('border-width') as number) > 0,
  },
  NodeWithInsideDetail: {
    relevantToNode: (node: Node, style: StyleFunction) =>
      (hasIcon(node, style) && style('icon-position') === 'inside') ||
      (hasCaption(node) && style('caption-position') === 'inside') ||
      (hasProperty(node) && style('property-position') === 'inside'),
  },
  NodeWithOutsideDetail: {
    relevantToNode: (node: Node, style: StyleFunction) =>
      (hasIcon(node, style) && style('icon-position') === 'outside') ||
      (hasCaption(node) && style('caption-position') === 'outside') ||
      (hasProperty(node) && style('property-position') === 'outside'),
  },
  NodeWithIcon: {
    relevantToNode: hasIcon,
  },
  NodeOrRelationshipWithIcon: {
    relevantToNode: hasIcon,
    relevantToRelationship: hasIcon,
  },
  NodeWithCaption: {
    relevantToNode: hasCaption,
  },
  NodeWithCaptionOutside: {
    relevantToNode: (node: Node, style: StyleFunction) =>
      hasCaption(node) && style('caption-position') === 'outside',
  },
  Relationship: {
    relevantToRelationship: () => true,
  },
  RelationshipWithDetail: {
    relevantToRelationship: (relationship: Relationship) =>
      hasType(relationship) || hasProperty(relationship),
  },
  RelationshipWithType: {
    relevantToRelationship: hasType,
  },
  NodeOrRelationshipWithProperty: {
    relevantToNode: hasProperty,
    relevantToRelationship: hasProperty,
  },
};

const graphStyleSelector = (graph: Graph) => graph.style || {};

const specificOrGeneral = (
  styleKey: string,
  entity: Entity,
  graphStyle: Style
) => {
  if (entity.style && Object.hasOwn(entity.style, styleKey)) {
    return entity.style[styleKey];
  }
  return graphStyle[styleKey];
};

export const getStyleSelector = (entity: Entity, styleKey: string) =>
  createSelector(graphStyleSelector, (graphStyle) =>
    validate(styleKey, specificOrGeneral(styleKey, entity, graphStyle))
  );

export const categoriesPresent = (
  nodes: Node[],
  relationships: Relationship[],
  graph: Graph
) => {
  const categories: string[] = [];
  nodes.forEach((node) => {
    const style = (styleAttribute: string) =>
      getStyleSelector(node, styleAttribute)(graph);
    for (const [category, filter] of Object.entries(styleFilters)) {
      if ('relevantToNode' in filter && filter.relevantToNode(node, style)) {
        categories.push(category);
      }
    }
  });
  relationships.forEach((relationship: Relationship) => {
    const style = (styleAttribute: string) =>
      getStyleSelector(relationship, styleAttribute)(graph);
    for (const [category, filter] of Object.entries(styleFilters)) {
      if (
        'relevantToRelationship' in filter &&
        filter.relevantToRelationship(relationship, style)
      ) {
        categories.push(category);
      }
    }
  });
  return categories;
};

export const styleAttributeGroups = [
  {
    name: 'General',
    entityTypes: ['node', 'relationship'],
    attributes: [
      {
        key: 'font-family',
        appliesTo: 'Everything',
        type: 'font-family',
        defaultValue: 'sans-serif',
      },
      {
        key: 'background-color',
        appliesTo: 'Everything',
        type: 'color',
        defaultValue: white,
      },
      {
        key: 'background-image',
        appliesTo: 'Everything',
        type: 'image',
        defaultValue: '',
      },
      {
        key: 'background-size',
        appliesTo: 'Everything',
        type: 'percentage',
        defaultValue: '100%',
      },
    ],
  },
  {
    name: 'Nodes',
    entityTypes: ['node'],
    attributes: [
      {
        key: 'node-color',
        appliesTo: 'Node',
        type: 'color',
        defaultValue: white,
      },
      {
        key: 'border-width',
        appliesTo: 'Node',
        type: 'line-width',
        defaultValue: 4,
      },
      {
        key: 'border-color',
        appliesTo: 'NodeWithBorder',
        type: 'color',
        defaultValue: black,
      },
      {
        key: 'radius',
        appliesTo: 'Node',
        type: 'radius',
        defaultValue: defaultNodeRadius,
      },
      {
        key: 'node-padding',
        appliesTo: 'NodeWithInsideDetail',
        type: 'spacing',
        defaultValue: 5,
      },
      {
        key: 'node-margin',
        appliesTo: 'NodeWithOutsideDetail',
        type: 'spacing',
        defaultValue: 2,
      },
      {
        key: 'outside-position',
        appliesTo: 'NodeWithOutsideDetail',
        type: 'outside-position',
        defaultValue: 'auto',
      },
      {
        key: 'node-icon-image',
        appliesTo: 'Node',
        type: 'image',
        defaultValue: '',
      },
      {
        key: 'node-background-image',
        appliesTo: 'Node',
        type: 'image',
        defaultValue: '',
      },
    ],
  },
  {
    name: 'Icons',
    entityTypes: ['node'],
    attributes: [
      {
        key: 'icon-position',
        appliesTo: 'NodeWithIcon',
        type: 'inside-outside',
        defaultValue: 'inside',
      },
      {
        key: 'icon-size',
        appliesTo: 'NodeOrRelationshipWithIcon',
        type: 'radius',
        defaultValue: 64,
      },
    ],
  },
  {
    name: 'Node Captions',
    entityTypes: ['node'],
    attributes: [
      {
        key: 'caption-position',
        appliesTo: 'NodeWithCaption',
        type: 'inside-outside',
        defaultValue: 'inside',
      },
      {
        key: 'caption-max-width',
        appliesTo: 'NodeWithCaptionOutside',
        type: 'radius',
        defaultValue: 200,
      },
      {
        key: 'caption-color',
        appliesTo: 'NodeWithCaption',
        type: 'color',
        defaultValue: black,
      },
      {
        key: 'caption-font-size',
        appliesTo: 'NodeWithCaption',
        type: 'font-size',
        defaultValue: defaultFontSize,
      },
      {
        key: 'caption-font-weight',
        appliesTo: 'NodeWithCaption',
        type: 'font-weight',
        defaultValue: 'normal',
      },
    ],
  },
  {
    name: 'Node Labels',
    entityTypes: ['node'],
    attributes: [
      {
        key: 'label-position',
        appliesTo: 'NodeWithLabel',
        type: 'inside-outside',
        defaultValue: 'inside',
      },
      {
        key: 'label-display',
        appliesTo: 'NodeWithLabel',
        type: 'label-display',
        defaultValue: 'pill',
      },
      {
        key: 'label-color',
        appliesTo: 'NodeWithLabel',
        type: 'color',
        defaultValue: black,
      },
      {
        key: 'label-background-color',
        appliesTo: 'NodeWithLabel',
        type: 'color',
        defaultValue: white,
      },
      {
        key: 'label-border-color',
        appliesTo: 'NodeWithLabel',
        type: 'color',
        defaultValue: black,
      },
      {
        key: 'label-border-width',
        appliesTo: 'NodeWithLabel',
        type: 'line-width',
        defaultValue: 4,
      },
      {
        key: 'label-font-size',
        appliesTo: 'NodeWithLabel',
        type: 'font-size',
        defaultValue: defaultFontSize * (4 / 5),
      },
      {
        key: 'label-padding',
        appliesTo: 'NodeWithLabel',
        type: 'spacing',
        defaultValue: 5,
      },
      {
        key: 'label-margin',
        appliesTo: 'NodeWithLabel',
        type: 'spacing',
        defaultValue: 4,
      },
    ],
  },
  {
    name: 'Arrows',
    entityTypes: ['relationship'],
    attributes: [
      {
        key: 'detail-position',
        appliesTo: 'RelationshipWithDetail',
        type: 'detail-position',
        defaultValue: 'inline',
      },
      {
        key: 'detail-orientation',
        appliesTo: 'RelationshipWithDetail',
        type: 'orientation',
        defaultValue: 'parallel',
      },
      {
        key: 'arrow-width',
        appliesTo: 'Relationship',
        type: 'line-width',
        defaultValue: 5,
      },
      {
        key: 'arrow-color',
        appliesTo: 'Relationship',
        type: 'color',
        defaultValue: black,
      },
      {
        key: 'margin-start',
        appliesTo: 'Relationship',
        type: 'spacing',
        defaultValue: 5,
      },
      {
        key: 'margin-end',
        appliesTo: 'Relationship',
        type: 'spacing',
        defaultValue: 5,
      },
      {
        key: 'margin-peer',
        appliesTo: 'Relationship',
        type: 'spacing',
        defaultValue: 20,
      },
      {
        key: 'attachment-start',
        appliesTo: 'Relationship',
        type: 'attachment',
        defaultValue: 'normal',
      },
      {
        key: 'attachment-end',
        appliesTo: 'Relationship',
        type: 'attachment',
        defaultValue: 'normal',
      },
      {
        key: 'relationship-icon-image',
        appliesTo: 'Relationship',
        type: 'image',
        defaultValue: '',
      },
    ],
  },
  {
    name: 'Relationship Types',
    entityTypes: ['relationship'],
    attributes: [
      {
        key: 'type-color',
        appliesTo: 'RelationshipWithType',
        type: 'color',
        defaultValue: black,
      },
      {
        key: 'type-background-color',
        appliesTo: 'RelationshipWithType',
        type: 'color',
        defaultValue: white,
      },
      {
        key: 'type-border-color',
        appliesTo: 'RelationshipWithType',
        type: 'color',
        defaultValue: black,
      },
      {
        key: 'type-border-width',
        appliesTo: 'RelationshipWithType',
        type: 'line-width',
        defaultValue: 0,
      },
      {
        key: 'type-font-size',
        appliesTo: 'RelationshipWithType',
        type: 'font-size',
        defaultValue: 16,
      },
      {
        key: 'type-padding',
        appliesTo: 'RelationshipWithType',
        type: 'spacing',
        defaultValue: 5,
      },
    ],
  },
  {
    name: 'Properties',
    entityTypes: ['node', 'relationship'],
    attributes: [
      {
        key: 'property-position',
        appliesTo: 'NodeOrRelationshipWithProperty',
        type: 'inside-outside',
        defaultValue: 'outside',
      },
      {
        key: 'property-alignment',
        appliesTo: 'NodeOrRelationshipWithProperty',
        type: 'property-alignment',
        defaultValue: 'colon',
      },
      {
        key: 'property-color',
        appliesTo: 'NodeOrRelationshipWithProperty',
        type: 'color',
        defaultValue: black,
      },
      {
        key: 'property-font-size',
        appliesTo: 'NodeOrRelationshipWithProperty',
        type: 'font-size',
        defaultValue: 16,
      },
      {
        key: 'property-font-weight',
        appliesTo: 'NodeOrRelationshipWithProperty',
        type: 'font-weight',
        defaultValue: 'normal',
      },
    ],
  },
];

export const styleAttributes = Object.fromEntries(
  styleAttributeGroups
    .flatMap((group) => group.attributes)
    .map((attribute) => [attribute.key, attribute])
);

export const nodeStyleAttributes = styleAttributeGroups
  .filter((group) => group.entityTypes.includes('node'))
  .flatMap((group) => group.attributes)
  .map((attribute) => attribute.key);

export const relationshipStyleAttributes = styleAttributeGroups
  .filter((group) => group.entityTypes.includes('relationship'))
  .flatMap((group) => group.attributes)
  .map((attribute) => attribute.key);

export const imageAttributes = styleAttributeGroups
  .flatMap((group) => group.attributes)
  .filter((attribute) => attribute.type === 'image')
  .map((attribute) => attribute.key);

export interface EditorConfig {
  editor: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

// ABK make this a discrimined union of editor/style types
export const styleTypes: Record<string, EditorConfig> = {
  radius: { editor: 'slider', min: 1, max: 1000, step: 5 },
  'line-width': { editor: 'slider', min: 0, max: 25, step: 1 },
  spacing: { editor: 'slider', min: 0, max: 50, step: 1 },
  'font-size': { editor: 'slider', min: 5, max: 100, step: 1 },
  color: { editor: 'colorPicker' },
  'font-family': {
    editor: 'dropdown',
    options: ['sans-serif', ...googleFonts.map((font) => font.fontFamily)],
  },
  'font-weight': { editor: 'dropdown', options: ['normal', 'bold'] },
  'outside-position': {
    editor: 'dropdown',
    options: [
      'auto',
      'top-left',
      'top',
      'top-right',
      'right',
      'bottom-right',
      'bottom',
      'bottom-left',
      'left',
    ],
  },
  'inside-outside': { editor: 'dropdown', options: ['inside', 'outside'] },
  'detail-position': {
    editor: 'dropdown',
    options: ['inline', 'above', 'below'],
  },
  orientation: {
    editor: 'dropdown',
    options: ['parallel', 'perpendicular', 'horizontal'],
  },
  'property-alignment': { editor: 'dropdown', options: ['colon', 'center'] },
  'label-display': { editor: 'dropdown', options: ['pill', 'bare'] },
  attachment: {
    editor: 'dropdown',
    options: ['normal', 'top', 'right', 'bottom', 'left'],
  },
  image: { editor: 'imageUrl' },
  percentage: { editor: 'percentageSlider', min: 5, max: 1000, step: 5 },
};

export const completeWithDefaults = (style: Style) => {
  const completeStyle: Style = {};
  Object.keys(styleAttributes).forEach((key) => {
    if (Object.hasOwn(style, key)) {
      completeStyle[key] = style[key];
    } else {
      completeStyle[key] = styleAttributes[key].defaultValue;
    }
  });
  return completeStyle;
};

export const validate = (styleKey: string, value: any) => {
  const styleAttribute = styleAttributes[styleKey];
  const styleType = styleTypes[styleAttribute.type];
  switch (styleType.editor) {
    case 'slider':
    case 'percentageSlider':
      if (!isNaN(value)) {
        if (value < styleType.min!) {
          return styleType.min;
        }
        if (value > styleType.max!) {
          return styleType.max;
        }
        return value;
      }
      break;

    case 'colorPicker':
      if (/^#[0-9A-F]{6}$/i.test(value)) {
        return value;
      }
      break;

    case 'dropdown':
      if (styleType.options!.includes(value)) {
        return value;
      }
      break;

    case 'imageUrl':
      return value;
  }
  return styleAttribute.defaultValue;
};
