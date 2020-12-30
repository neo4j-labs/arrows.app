import React, {Component} from 'react';
import {Form, TextArea} from "semantic-ui-react";

class ExportJsonPanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Form>
        <TextArea
          style={{
            height: 500,
            fontFamily: 'monospace'
          }}
          value={JSON.stringify(this.props.graph, null, 2)}
        />
      </Form>
    )
  }
}

export default ExportJsonPanel