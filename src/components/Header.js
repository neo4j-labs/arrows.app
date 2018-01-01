import React, {Component} from 'react';
import {FETCHING_GRAPH, FETCHING_GRAPH_FAILED} from "../reducers/storageStatus";

export const headerHeight = 50;

export default class Header extends Component {
  render() {
    const headerStyle = {
      height: headerHeight
    };
    let storageStatusMessage = null;
    if (this.props.storageStatus === FETCHING_GRAPH) {
      storageStatusMessage = (
        <span>Loading graph from database...</span>
      )
    }
    if (this.props.storageStatus === FETCHING_GRAPH_FAILED) {
      storageStatusMessage = (
        <span>Failed to load graph from database, see Javascript console for details.</span>
      )
    }
    return (
      <header style={headerStyle} className="App-header">
        <button onClick={this.props.onPlusNodeClick}>+ Node</button>
        <button onClick={this.props.onReloadGraphClick}>Reload graph</button>
        {storageStatusMessage}
      </header>
    )
  }
}
