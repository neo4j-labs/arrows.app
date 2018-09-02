import React from 'react';
import {connect} from 'react-redux'
import {FETCHING_GRAPH, FETCHING_GRAPH_FAILED, UPDATING_GRAPH, UPDATING_GRAPH_FAILED} from "../state/storageStatus";
import { Icon, Menu } from 'semantic-ui-react'

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

const editConnectionParameters = (props) => {
  return props.connectionParametersEditable ? (
    <Menu.Item onClick={props.onEditConnectionParameters}>
      <Icon name='lightning'/>Database connection
    </Menu.Item>
  ) : null
}
const Header = (props) => (
  <Menu attached='top' style={{borderRadius: 0}}>
    <Menu.Item onClick={props.onPlusNodeClick}>
      <Icon name='add'/>Node
    </Menu.Item>
    <Menu.Item onClick={props.onReloadGraphClick}>
      <Icon name='refresh'/>Graph
    </Menu.Item>
    {editConnectionParameters(props)}
    <Menu.Item onClick={props.onGoogleDriveClick}>
      <Icon name='google drive'/>Google drive
    </Menu.Item>
    {storageStatusMessage(props)}
    <Menu.Item
      position='right'
      onClick={props.showInspector}
    >
      <Icon name='angle double left'/>
    </Menu.Item>
  </Menu>
)

export default connect(null, null)(Header)