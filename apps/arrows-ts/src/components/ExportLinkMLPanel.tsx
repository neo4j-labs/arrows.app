import React, { Component } from 'react';
import { Form, Icon, TextArea } from 'semantic-ui-react';
import { Base64 } from 'js-base64';
import yaml from 'js-yaml';
import { fromGraph } from '@neo4j-arrows/linkml';

class ExportLinkMLPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const linkMLString = yaml.dump(
      fromGraph(this.props.diagramName, this.props.graph)
    );

    const handleDownloadPydantic = async () => {
      const response = await fetch(import.meta.env.VITE_GEN_PYDANTIC_ENDPOINT, {
        body: linkMLString,
        method: 'POST',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', this.props.diagramName + '.py');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

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
          <a className="ui button" onClick={handleDownloadPydantic}>
            <Icon name="download" />
            Download Pydantic
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
