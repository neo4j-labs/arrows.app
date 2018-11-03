import React from 'react';
import {connect} from 'react-redux'
import {FETCHING_GRAPH, FETCHING_GRAPH_FAILED, UPDATING_GRAPH, UPDATING_GRAPH_FAILED} from "../state/storageStatus";
import { Icon, Menu } from 'semantic-ui-react'
import DocumentTitle from 'react-document-title'
import {DiagramNameEditor} from "./DiagramNameEditor";

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
      <Icon name='database'/>Graph storage
    </Menu.Item>
  ) : null
}

const googleDriveItem = (props) => {
  if (props.storage.fileId) {
    return (
      <Menu.Item onClick={() => props.onGoogleDriveClick()}>
        <Icon name='google drive'/>
        Save to Google drive
      </Menu.Item>
    )
  } else {
    return null
  }
}

const Header = (props) => (
  <Menu attached='top' style={{borderRadius: 0}}>
    <Menu.Item>
      <DocumentTitle title={props.diagramName + ' - Arrows'}>
        <DiagramNameEditor
          diagramName={props.diagramName}
          setDiagramName={props.setDiagramName}
        />
      </DocumentTitle>
    </Menu.Item>
    <Menu.Item onClick={props.onPlusNodeClick}>
      <Icon name='plus circle'/>Node
    </Menu.Item>
    <Menu.Item onClick={props.onReloadGraphClick}>
      <Icon name='refresh'/>Graph
    </Menu.Item>
    {editConnectionParameters(props)}
    {googleDriveItem(props)}
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