import React, {Component} from 'react';

export class GoogleDriveIntegration extends Component {
  componentDidMount() {
    if (window.gapi) {
      window.gapi.load("client:auth2:picker", this.initClient);
    }
  }

  render() {
    return null
  }
}