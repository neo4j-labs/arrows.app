import React from 'react';
import {connect} from 'react-redux'
import { Icon, Menu, Popup } from 'semantic-ui-react'
import DocumentTitle from 'react-document-title'
import {DiagramNameEditor} from "./DiagramNameEditor";
import neo4j_logo from  './neo4j_icon.svg'

const storageStatusMessage = (props) => {
  const storageNames = {
    DATABASE: 'Neo4j database',
    GOOGLE_DRIVE: 'Google Drive'
  }
  const moodIcons = {
    HAPPY: 'check circle outline',
    BUSY: 'dot circle outline',
    SAD: 'warning'
  }
  const storageName = storageNames[props.storage.mode]
  if (storageName) {
    const statusMessages = {
      IDLE: `Graph stored safely in ${storageName}`,
      FETCHING_GRAPH: `Loading graph from ${storageName}...`,
      FETCHING_GRAPH_FAILED: `Failed to load graph from ${storageName}, see Javascript console for details.`,
      UPDATING_GRAPH: `Saving graph to ${storageName}...`,
      UPDATING_GRAPH_FAILED: `Failed to save graph to ${storageName}, see Javascript console for details.`
    }
    return (
      <Popup trigger={<Icon name={moodIcons[props.storageStatus.mood]}/>}
             content={statusMessages[props.storageStatus.status]}/>
    )
  } else {
    return null
  }
}

const storageIcon = (props) => {
  switch (props.storage.mode) {
    case 'DATABASE':
      return (
        <img height='14px' src={neo4j_logo}
             onClick={props.onViewStorageConfig}/>
      )
    case 'GOOGLE_DRIVE':
      return (
        <Icon name='google drive'
              onClick={props.onViewStorageConfig}/>
      )
    default:
      return null
  }
}

const Header = (props) => (
  <Menu attached='top' style={{borderRadius: 0}} borderless>
    <Menu.Item style={{
      minWidth: 200
    }}>
      <DocumentTitle title={props.diagramName + ' - Arrows'}>
        <DiagramNameEditor
          diagramName={props.diagramName}
          setDiagramName={props.setDiagramName}
        />
      </DocumentTitle>
    </Menu.Item>
    <Menu.Item>
      {storageIcon(props)}
      {storageStatusMessage(props)}
      <Icon onClick={props.onReloadGraphClick} name='refresh'/>
    </Menu.Item>
    <Menu.Item active={true} color='blue'>
      <Icon name='users'/>Share
    </Menu.Item>
    <Menu.Item onClick={props.onExportClick}>
      <Icon name='download'/>
    </Menu.Item>
    <Menu.Item onClick={props.onPlusNodeClick}>
      <Icon name='plus circle'/>Node
    </Menu.Item>
    <Menu.Item
      position='right'
      onClick={props.showInspector}
    >
      <Icon name='angle double left'/>
    </Menu.Item>
  </Menu>
)

export default connect(null, null)(Header)