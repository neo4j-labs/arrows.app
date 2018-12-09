import React from 'react';
import {connect} from 'react-redux'
import { Icon, Menu, Popup, Dropdown } from 'semantic-ui-react'
import DocumentTitle from 'react-document-title'
import {DiagramNameEditor} from "./DiagramNameEditor";

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
        <Icon name='database'/>
      )
    case 'GOOGLE_DRIVE':
      return (
        <Icon name='google drive'/>
      )
    default:
      return null
  }
}

const Header = (props) => (
  <Menu attached='top' style={{borderRadius: 0}} borderless>
    <Dropdown item icon='bars'>
      <Dropdown.Menu>
        <Dropdown.Item
          icon='square outline'
          text='New Diagram'
          onClick={props.onNewDiagramClick}
        />
      </Dropdown.Menu>
    </Dropdown>
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
    <Menu.Item onClick={props.storage.mode === 'DATABASE' ? props.onEditConnectionParameters : null}>
      {storageIcon(props)}
      {storageStatusMessage(props)}
    </Menu.Item>
    <Menu.Item onClick={props.onReloadGraphClick}>
      <Icon name='refresh'/>
    </Menu.Item>
    <Menu.Item onClick={props.onExportClick}>
      <Icon name='download'/>
    </Menu.Item>
    <Menu.Item onClick={props.onPlusNodeClick}>
      <Icon.Group>
        <Icon name='circle' />
        <Icon corner name='add' />
      </Icon.Group>
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