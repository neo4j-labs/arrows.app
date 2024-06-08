import React, { Component } from 'react';
import { Form, Icon, TextArea } from 'semantic-ui-react';
import { Base64 } from 'js-base64';
import yaml from 'js-yaml';
import { Graph } from '../../../../libs/model/src/lib/Graph';
import { Node } from '../../../../libs/model/src/lib/Node';
import { Relationship } from '../../../../libs/model/src/lib/Relationship';
import { plural } from 'pluralize';
import { camelCase, snakeCase, upperFirst } from 'lodash';

type Attribute = {
  range?: string;
  description?: string;
  multivalued?: boolean;
};

enum SpiresCoreClasses {
  NamedEntity = 'NamedEntity',
  Triple = 'Triple',
}

type LinkMLClass = {
  attributes?: Record<string, Attribute>;
  description?: string;
  is_a?: SpiresCoreClasses;
  slot_usage?: Record<string, Attribute>;
  tree_root?: boolean;
};

type LinkML = {
  id: string;
  name: string;
  title: string;
  classes: Record<string, LinkMLClass>;
  imports?: string[];
};

const graphToLinkML = (
  name: string,
  { nodes, relationships }: Graph
): LinkML => {
  const toClassName = (str: string): string => upperFirst(camelCase(str));
  const toAttributeName = (str: string): string => snakeCase(str);
  const nodeIdToNodeCaption = (id: string): string => {
    return nodes.find((node) => node.id === id).caption;
  };
  const toRelationshipClassName = ({ fromId, toId }: Relationship): string => {
    return `${toClassName(nodeIdToNodeCaption(fromId))}To${toClassName(
      nodeIdToNodeCaption(toId)
    )}`;
  };

  const getAnnotations = (): LinkMLClass => {
    return {
      tree_root: true,
      attributes: nodes.reduce(
        (attributes: Record<string, Attribute>, node) => ({
          ...attributes,
          [toAttributeName(plural(node.caption))]: {
            range: toClassName(node.caption),
            multivalued: true,
          },
        }),
        {}
      ),
    };
  };

  const nodeToClass = (node: Node): LinkMLClass => {
    const propertiesToAttributes = (): Record<string, Attribute> => {
      return Object.entries(node.properties).reduce(
        (attributes: Record<string, Attribute>, [key, value]) => ({
          ...attributes,
          [toAttributeName(key)]: {
            description: value,
          },
        }),
        {}
      );
    };

    return {
      is_a: SpiresCoreClasses.NamedEntity,
      attributes: propertiesToAttributes(),
    };
  };

  const relationshipToRelationshipClass = (
    relationship: Relationship
  ): LinkMLClass => {
    return {
      is_a: SpiresCoreClasses.Triple,
      description: `A triple where the subject is a ${nodeIdToNodeCaption(
        relationship.fromId
      )} and the object is a ${nodeIdToNodeCaption(relationship.toId)}.`,
      slot_usage: {
        subject: {
          range: toClassName(nodeIdToNodeCaption(relationship.fromId)),
        },
        object: {
          range: toClassName(nodeIdToNodeCaption(relationship.toId)),
        },
        predicate: {
          range: `${toRelationshipClassName(relationship)}Predicate`,
        },
      },
    };
  };

  const relationshipToPredicateClass = (
    relationship: Relationship
  ): LinkMLClass => {
    return {
      is_a: SpiresCoreClasses.NamedEntity,
      description: `The predicate for the ${nodeIdToNodeCaption(
        relationship.fromId
      )} to ${nodeIdToNodeCaption(relationship.toId)} relationships.`,
    };
  };

  const snakeCasedName = snakeCase(name);

  return {
    id: `https://example.com/${snakeCasedName}`,
    name: snakeCasedName,
    title: name,
    imports: ['core'],
    classes: {
      ...{ [`${toClassName(name)}Annotations`]: getAnnotations() },
      ...nodes.reduce(
        (classes: Record<string, LinkMLClass>, node) => ({
          ...classes,
          [toClassName(node.caption)]: nodeToClass(node),
        }),
        {}
      ),
      ...relationships.reduce(
        (classes: Record<string, LinkMLClass>, relationship) => ({
          ...classes,
          [`${toRelationshipClassName(relationship)}Relationship`]:
            relationshipToRelationshipClass(relationship),
          [`${toRelationshipClassName(relationship)}Predicate`]:
            relationshipToPredicateClass(relationship),
        }),
        {}
      ),
    },
  };
};

class ExportLinkMLPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const linkMLString = yaml.dump(
      graphToLinkML(this.props.diagramName, this.props.graph)
    );
    const dataUrl =
      'data:application/yaml;base64,' + Base64.encode(linkMLString);

    return (
      <Form>
        <Form.Field>
          <a
            className="ui button"
            href={dataUrl}
            download={this.props.diagramName + '.yaml'}
          >
            <Icon name="download" />
            Download
          </a>
        </Form.Field>
        <TextArea
          style={{
            height: 500,
            fontFamily: 'monospace',
          }}
          value={linkMLString}
        />
      </Form>
    );
  }
}

export default ExportLinkMLPanel;
