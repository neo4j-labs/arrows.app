import React, {Component} from 'react';
import {Form, Button, TextArea, Icon, Message} from 'semantic-ui-react'
import {exportCypher} from "../storage/exportCypher";

class ExportCypherPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      includeStyling: false,
      keyword: 'CREATE'
    }
  }

  copyToClipboard = (cypher) => {
    navigator.clipboard.writeText(cypher)
  }

  runInNeo4jBrowser = (cypher) => {
    const url = 'neo4j-desktop://graphapps/neo4j-browser?cmd=edit&arg=' +
      encodeURIComponent(cypher.replaceAll('&', '\\u0026'))
    window.open(url)
  }

  render() {
    const options = {
      includeStyling: this.state.includeStyling
    }
    const cypher = exportCypher(this.props.graph, this.state.keyword, options)
    const keywordRadioButtons = ['CREATE', 'MATCH', 'MERGE'].map(keyword => {
      return (
        <Form.Radio
          key={keyword}
          label={keyword}
          value={keyword}
          checked={this.state.keyword === keyword}
          onClick={(e, { value }) => {
            this.setState({
              keyword: value
            })
          }}
        />
      )
    })
    const mergeWarning = this.state.keyword === 'MERGE' ? (
      <Message info>
        MERGE query behaviour depends on what data is already present in the database. You may need to edit the
        query to achieve exactly the behaviour you are looking for. Please see <a
        href='https://neo4j.com/docs/cypher-manual/current/clauses/merge/'
        target='_blank'>MERGE documentation</a> for guidance.
      </Message>
    ) : null
    return (
      <Form>
        <Form.Group inline>
          <label>Cypher Clause:</label>
          {keywordRadioButtons}
        </Form.Group>
        {mergeWarning}
        <Form.Field>
          <Button onClick={() => this.copyToClipboard(cypher)} primary icon labelPosition='left'>
            <Icon name='clipboard outline' />
            Copy to clipboard
          </Button>
          <Button onClick={() => this.runInNeo4jBrowser(cypher)} primary icon labelPosition='left'>
            <Icon name='terminal' />
            Run in Neo4j Browser
          </Button>
        </Form.Field>
        <TextArea
          style={{
            height: 500,
            fontSize: '1.5em',
            fontFamily: 'monospace'
          }}
          value={cypher}
        />
      </Form>
    )
  }
}

export default ExportCypherPanel