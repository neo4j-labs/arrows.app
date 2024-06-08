import React, { Component } from 'react';
import { Form, Icon, TextArea } from 'semantic-ui-react';
import { Base64 } from 'js-base64';
import yaml from 'js-yaml';
import { exportLinkML } from '../linkml/exportLinkML';

class ExportLinkMLPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const linkMLString = yaml.dump(
      exportLinkML(this.props.diagramName, this.props.graph)
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
