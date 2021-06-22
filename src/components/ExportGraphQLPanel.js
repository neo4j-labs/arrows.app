import React, { Component } from "react";
import { Form, Icon, TextArea, Message } from "semantic-ui-react";
import { Base64 } from "js-base64";
import exportGraphQL from "../graphql/exportGraphQL";

class ExportGraphQLPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      typeDefs: "",
    };
    this.exportToGraphQL = this.exportToGraphQL.bind(this);
  }

  exportToGraphQL() {
    try {
      const typeDefs = exportGraphQL(this.props.graph);

      this.setState((s) => ({
        ...s,
        typeDefs,
      }));
    } catch (error) {
      this.setState((s) => ({ ...s, error }));
    }
  }

  componentDidMount() {
    this.exportToGraphQL();
  }

  render() {
    const dataUrl = "data:text;base64," + Base64.encode(this.state.typeDefs);

    return (
      <React.Fragment>
        {this.state.error && (
          <Message info error>
            <div>
              <p>{this.state.error.message}</p>
            </div>
          </Message>
        )}

        <Form>
          <Message info icon>
            <Icon name="info" />
            <div>
              <p>
                Below you are seeing a GraphQL schema. Use this schema with the{" "}
                <a href="https://neo4j.com/docs/graphql-manual/current/">
                  Neo4j GraphQL Library.
                </a>
              </p>
              <ul>
                <li>
                  Clicking on the "Download" link to download a file to your
                  computer.
                </li>
              </ul>
            </div>
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
              fontFamily: "monospace",
            }}
            value={this.state.typeDefs}
          />
        </Form>
      </React.Fragment>
    );
  }
}

export default ExportGraphQLPanel;
