import React, {Component} from 'react';
import {Form, Button, Checkbox, TextArea} from 'semantic-ui-react'
import {exportCypher} from "../storage/exportCypher";

class ExportCypherPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      includeStyling: false,
      keyword: 'CREATE'
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

  render() {
    const cypher = exportCypher(this.props.graph, this.state.keyword, this.state.includeStyling)
    const keywordButtons = ['CREATE', 'MERGE', 'MATCH'].map(keyword => {
      return (
        <Button
          key={keyword}
          primary={this.state.keyword === keyword}
          onClick={() => {
            this.setState({
              keyword: keyword
            })
          }}
        >{keyword}</Button>
      )
    })
    return (
      <Form>
        <Form.Field>
          <label>Cypher Clause:</label>
          <Button.Group size="mini">
            {keywordButtons}
          </Button.Group>
        </Form.Field>
        <Form.Field>
          <Checkbox label='Include style properties' checked={this.state.includeStyling}
                    onChange={this.toggleStyling}/>
        </Form.Field>
        <Form.Field>
          <Button onClick={() => this.copyToClipboard(cypher)}>Copy to clipboard</Button>
        </Form.Field>
        <TextArea
          style={{
            height: 500,
            fontFamily: 'monospace'
          }}
          value={cypher}
        />
      </Form>
    )
  }
}

export default ExportCypherPanel