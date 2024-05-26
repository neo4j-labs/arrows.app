import React, { Component } from 'react';
import { Form, Icon, TextArea } from 'semantic-ui-react';
import { Base64 } from 'js-base64';
import yaml from 'js-yaml';
import { Graph } from '../../../../libs/model/src/lib/Graph';
import { Node } from '../../../../libs/model/src/lib/Node';
import { Relationship } from '../../../../libs/model/src/lib/Relationship';
import { plural } from 'pluralize';
import { snakeCase } from 'lodash';

type Attribute = {
  range: string;
};

type SpiresClass = {
  attributes: Record<string, Attribute>;
};

type Spires = {
  id: string;
  name: string;
  title: string;
  classes: Record<string, SpiresClass>;
};

const graphToSpires = (
  name: string,
  { nodes, relationships }: Graph
): Spires => {
  const relationshipsByNode = (node: Node): Record<string, Attribute> => {
    const getSourceNodeName = (relationship: Relationship): string =>
      nodes.find((node) => node.id === relationship.fromId)?.caption;

    const getRelationshipName = (relationship: Relationship): string =>
      plural(getSourceNodeName(relationship).toLocaleLowerCase());

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

  const nodeToClass = (node: Node): SpiresClass => ({
    attributes: relationshipsByNode(node),
  });

  const snakeCasedName = snakeCase(name);

  return {
    id: `https://example.com/${snakeCasedName}`,
    name: snakeCasedName,
    title: name,
    classes: nodes.reduce(
      (classes: Record<string, SpiresClass>, node) => ({
        ...classes,
        [node.caption]: nodeToClass(node),
      }),
      {}
    ),
  };
};

class ExportSpiresPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const spiresString = yaml.dump(
      graphToSpires(this.props.diagramName, this.props.graph)
    );
    const dataUrl =
      'data:application/yaml;base64,' + Base64.encode(spiresString);

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
          value={spiresString}
        />
      </Form>
    );
  }
}

export default ExportSpiresPanel;
