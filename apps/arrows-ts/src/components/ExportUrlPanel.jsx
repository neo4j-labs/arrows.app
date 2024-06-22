import React, { Component } from 'react';
import { Base64 } from 'js-base64';

class ExportUrlPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { graph, diagramName } = this.props;
    const jsonString = JSON.stringify({ graph, diagramName });
    const url =
      window.location.origin + '/#/import/json=' + Base64.encode(jsonString);

    return (
      <p>
        Copy the URL of{' '}
        <a href={url} target="_blank">
          This Link
        </a>{' '}
        and paste it somewhere else, as a low-tech sharing mechanism.
      </p>
    );
  }
}

export default ExportUrlPanel;
