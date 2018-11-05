import React, {Component} from 'react';

export class GoogleDriveIntegration extends Component {
  componentDidMount() {
    if (window.gapi) {
      window.gapi.load("client:auth2", this.initClient);
      window.gapi.load("client:picker", () => console.log('Picker loaded'));
    }
  }

  render() {
    return null
  }
}