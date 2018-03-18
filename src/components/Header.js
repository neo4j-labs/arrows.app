import React from 'react';
import {connect} from 'react-redux'
import {FETCHING_GRAPH, FETCHING_GRAPH_FAILED, UPDATING_GRAPH, UPDATING_GRAPH_FAILED} from "../state/storageStatus";
import { Button,  Header as SemanticHeader } from 'semantic-ui-react'

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
    <SemanticHeader style={headerStyle}>
      <Button onClick={props.onPlusNodeClick}>+ Node</Button>
      <Button onClick={props.onReloadGraphClick}>Reload graph</Button>
      {storageStatusMessage(props)}
    </SemanticHeader>
  )
}

export default connect(null, null)(Header)