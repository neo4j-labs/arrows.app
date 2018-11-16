import React from 'react';
import {connect} from 'react-redux'
import {FETCHING_GRAPH, FETCHING_GRAPH_FAILED, UPDATING_GRAPH, UPDATING_GRAPH_FAILED} from "../state/storageStatus";
import { Icon, Menu, Popup } from 'semantic-ui-react'
import DocumentTitle from 'react-document-title'
import {DiagramNameEditor} from "./DiagramNameEditor";
import neo4j_logo from  './neo4j_icon.svg'

const storageStatusMessage = (props) => {
  const storageNames = {
    NEO4J: 'Neo4j database',
    GOOGLE_DRIVE: 'Google Drive'
  }
  if (storageNames[props.storage.store]) {
    switch (props.storageStatus) {
      case FETCHING_GRAPH:
        return (
          <Popup trigger={<Icon name='dot circle outline'/>}
                 content='Loading graph from database...'/>
        )

      case FETCHING_GRAPH_FAILED:
        return (
          <Popup trigger={<Icon name='warning'/>}
                 content='Failed to load graph from database, see Javascript console for details.'/>
        )

      case UPDATING_GRAPH:
        return (
          <Popup trigger={<Icon name='dot circle outline'/>}
                 content='Saving graph to database...'/>
        )

      case UPDATING_GRAPH_FAILED: {
        return (
          <Popup trigger={<Icon name='warning'/>}
                 content='Failed to save graph to database, see Javascript console for details.'/>
        )
      }

      default: {
        return (
          <Popup trigger={<Icon name='check circle outline'/>}
                 content={`Graph stored safely in ${storageNames[props.storage.store]}`}/>
        )
      }
    }
  } else {
    return null
  }
}

const storageIcon = (props) => {
  switch (props.storage.store) {
    case 'NEO4J':
      return (
        <img height='14px' src={neo4j_logo}
             onClick={props.connectionParametersEditable ? props.onEditConnectionParameters : null}/>
      )
    case 'GOOGLE_DRIVE':
      return (
        <Icon name='google drive'
              onClick={props.onEditConnectionParameters}/>
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