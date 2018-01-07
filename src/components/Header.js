import React from 'react';
import {FETCHING_GRAPH, FETCHING_GRAPH_FAILED, UPDATING_GRAPH, UPDATING_GRAPH_FAILED} from "../state/storageStatus";

export const headerHeight = 50;

const storageStatusMessage = (props) => {
  if (props.storageStatus === FETCHING_GRAPH) {
    return (
      <span>Loading graph from database...</span>
    )
  }
  if (props.storageStatus === FETCHING_GRAPH_FAILED) {
    return (
      <span>Failed to load graph from database, see Javascript console for details.</span>
    )
  }
  if (props.storageStatus === UPDATING_GRAPH) {
    return (
      <span>Saving graph to database...</span>
    )
  }
  if (props.storageStatus === UPDATING_GRAPH_FAILED) {
    return (
      <span>Failed to save graph to database, see Javascript console for details.</span>
    )
  }
}

const Header = (props) => {
  const headerStyle = {
    height: headerHeight
  }

  return (
    <header style={headerStyle} className="App-header">
      <button onClick={props.onPlusNodeClick}>+ Node</button>
      <button onClick={props.onReloadGraphClick}>Reload graph</button>
      {storageStatusMessage(props)}
    </header>
  )
}

export default Header