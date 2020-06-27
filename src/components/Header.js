import React, { useState } from 'react'
import {connect} from 'react-redux'
import { Icon, Menu, Popup, Dropdown } from 'semantic-ui-react'
import { DiagramNameEditor } from "./DiagramNameEditor"
import arrows_logo from "../images/arrows_logo.svg"
import GoogleDriveShare from "./GoogleDriveShareWrapper"

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
    case 'LOCAL_STORAGE':
      return (
        <Icon name='disk'/>
      )
    default:
      return null
  }
}

const Header = (props) => {
  const openShareDialog = storage => {
    new GoogleDriveShare(storage).openDialog()
  }

  return (
    <Menu attached='top' style={{ borderRadius: 0 }} borderless>
      <Menu.Item onClick={props.onArrowsClick} style={{ padding: '0 0 0 1em', cursor: 'pointer' }}>
        <i className="icon" style={{ height: '1.5em' }}>
          <img src={arrows_logo} style={{ height: '1.5em' }}/>
        </i>
      </Menu.Item>
      <DiagramNameEditor
        diagramName={props.diagramName}
        setDiagramName={props.setDiagramName}
      />
      <Menu.Item onClick={props.storage.mode === 'DATABASE' ? props.onEditConnectionParameters : null}>
        {storageIcon(props)}
        {storageStatusMessage(props)}
      </Menu.Item>
      <Menu.Item onClick={props.onReloadGraphClick}>
        <Icon name='refresh'/>
      </Menu.Item>
      {props.storage.mode === 'GOOGLE_DRIVE' ?
        <Menu.Item onClick={() => openShareDialog(props.storage)}>
          <Icon name='share square' link/>
        </Menu.Item> : null}
      <Menu.Item onClick={props.onExportClick}>
        <Icon name='download'/>
      </Menu.Item>
      <Menu.Item onClick={props.onPlusNodeClick}>
        <Icon.Group>
          <Icon name='circle'/>
          <Icon corner name='add'/>
        </Icon.Group>
      </Menu.Item>
      <Menu.Item onClick={props.onHelpClick}>
        <Icon name='help'/>
      </Menu.Item>
      <Menu.Item
        position='right'
        onClick={props.showInspector}
      >
        <Icon name='angle double left'/>
      </Menu.Item>
    </Menu>
  )
}

export default Header
