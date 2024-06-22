import React, { Component } from 'react';
import { Form, Icon, TextArea, Message } from 'semantic-ui-react';
import { Base64 } from 'js-base64';
import exportGraphQL from '../graphql/exportGraphQL';

class ExportGraphQLPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      typeDefs: '',
    };
    this.exportToGraphQL = this.exportToGraphQL.bind(this);
  }

  exportToGraphQL() {
    try {
      const typeDefs = exportGraphQL(this.props.graph);

      this.setState({ typeDefs });
    } catch (error) {
      this.setState({ error });
    }
  }

  componentDidMount() {
    this.exportToGraphQL();
  }

  render() {
    if (this.state.error) {
      return (
        <Message info error>
          <Message.Content>{this.state.error.message}</Message.Content>
        </Message>
      );
    }

    const dataUrl = 'data:text;base64,' + Base64.encode(this.state.typeDefs);
    return (
      <Form>
        <Message info icon>
          <Icon name="info" />
          <Message.Content>
            This is a GraphQL schema based on the diagram. Use this schema with
            the{' '}
            <a
              href="https://neo4j.com/docs/graphql-manual/current/"
              target="_blank"
            >
              Neo4j GraphQL Library.
            </a>
          </Message.Content>
        </Message>

        <Form.Field>
          <a
            className="ui button"
            href={dataUrl}
            download={`${this.props.diagramName}-schema.gql`}
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
          value={this.state.typeDefs}
        />
      </Form>
    );
  }
}

export default ExportGraphQLPanel;
