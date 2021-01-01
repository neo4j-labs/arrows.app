import React, {Component} from 'react';
import {Form, Button, Checkbox, TextArea, Icon} from 'semantic-ui-react'
import {exportCypher} from "../storage/exportCypher";

class ExportCypherPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      includeStyling: false,
      keyword: 'MATCH'
    }
  }

  toggleStyling = () => {
    this.setState({
      includeStyling: !this.state.includeStyling
    })
  }

  copyToClipboard = (cypher) => {
    navigator.clipboard.writeText(cypher)
  }

  runInNeo4jBrowser = (cypher) => {
    const url = 'neo4j-desktop://graphapps/neo4j-browser?cmd=edit&arg=' + encodeURIComponent(cypher)
    window.open(url)
  }

  render() {
    const cypher = exportCypher(this.props.graph, this.state.keyword, this.state.includeStyling)
    const keywordRadioButtons = ['MATCH', 'CREATE', 'MERGE'].map(keyword => {
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
    return (
      <Form>
        <Form.Group inline>
          <label>Cypher Clause:</label>
          {keywordRadioButtons}
        </Form.Group>
        <Form.Field inline>
          <label>Styling:</label>
          <Checkbox label='Include entity-specific style properties' checked={this.state.includeStyling}
                    onChange={this.toggleStyling}/>
        </Form.Field>
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