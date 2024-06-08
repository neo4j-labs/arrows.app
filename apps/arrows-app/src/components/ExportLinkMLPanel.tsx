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
  range: string;
  multivalued?: boolean;
};

enum SpiresCoreClasses {
  NamedEntity = 'NamedEntity',
}

type LinkMLClass = {
  attributes: Record<string, Attribute>;
  is_a?: SpiresCoreClasses;
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

  const relationshipsByNode = (node: Node): Record<string, Attribute> => {
    const getSourceNodeName = (relationship: Relationship): string =>
      toClassName(
        nodes.find((node) => node.id === relationship.fromId)?.caption
      );

    const getRelationshipName = (relationship: Relationship): string =>
      toAttributeName(plural(getSourceNodeName(relationship)));

    return relationships
      .filter((relationship) => relationship.toId === node.id)
      .reduce(
        (attributes: Record<string, Attribute>, relationship) => ({
          ...attributes,
          [getRelationshipName(relationship)]: {
            range: getSourceNodeName(relationship),
          },
        }),
        {}
      );
  };

  const nodeToClass = (node: Node): LinkMLClass => ({
    is_a: SpiresCoreClasses.NamedEntity,
    attributes: relationshipsByNode(node),
  });

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
