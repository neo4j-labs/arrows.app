import React, {Component} from 'react';
import {FETCHING_GRAPH, FETCHING_GRAPH_FAILED, UPDATING_GRAPH, UPDATING_GRAPH_FAILED} from "../state/storageStatus";

export const headerHeight = 50;

export default class Header extends Component {
  render() {
    const headerStyle = {
      height: headerHeight
    };

    return (
      <header style={headerStyle} className="App-header">
        <button onClick={this.props.onPlusNodeClick}>+ Node</button>
        <button onClick={this.props.onReloadGraphClick}>Reload graph</button>
        {this.storageStatusMessage()}
      </header>
    )
  }

  storageStatusMessage() {
    if (this.props.storageStatus === FETCHING_GRAPH) {
      return (
        <span>Loading graph from database...</span>
      )
    }
    if (this.props.storageStatus === FETCHING_GRAPH_FAILED) {
      return (
        <span>Failed to load graph from database, see Javascript console for details.</span>
      )
    }
    if (this.props.storageStatus === UPDATING_GRAPH) {
      return (
        <span>Saving graph to database...</span>
      )
    }
    if (this.props.storageStatus === UPDATING_GRAPH_FAILED) {
      return (
        <span>Failed to save graph to database, see Javascript console for details.</span>
      )
    }
  }
}
