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
    const keywordRadioButtons = ['CREATE', 'MERGE', 'MATCH'].map(keyword => {
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