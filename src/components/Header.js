import React from 'react'
import { Icon, Menu, Popup, Button } from 'semantic-ui-react'
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
      GETTING_GRAPH: `Loading graph from ${storageName}...`,
      GETTING_GRAPH_FAILED: `Failed to load graph from ${storageName}, see Javascript console for details.`,
      UPDATING_GRAPH: `Saving graph to ${storageName}...`,
      PUTTING_GRAPH_FAILED: `Failed to save graph to ${storageName}, see Javascript console for details.`
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
      <div role="listbox" aria-expanded="true" className="ui item simple dropdown" tabIndex="0">
        <i className="icon" style={{ height: '1.5em' }}>
          <img src={arrows_logo} style={{ height: '1.5em' }} alt='Arrows.app logo'/>
        </i>
        <div className="menu transition visible">
          <div role="option" className="item">
            <i aria-hidden="true" className="dropdown icon"/>
            <span className="text">New</span>
            <div className="menu transition">
              <div role="option" className="item" onClick={props.onNewGoogleDriveDiagram}>use Google Drive</div>
              <div role="option" className="item" onClick={props.onNewLocalStorageDiagram}>use Local Storage</div>
            </div>
          </div>
          <div role="option" className="item" onClick={props.pickFromGoogleDrive}>Open...</div>
          <div className="divider"/>
          <div role="option" className="item" onClick={props.onHelpClick}>Help</div>
        </div>
      </div>
      <DiagramNameEditor
        diagramName={props.diagramName}
        setDiagramName={props.setDiagramName}
      />
      <Menu.Item onClick={props.storage.mode === 'DATABASE' ? props.onEditConnectionParameters : null}>
        {storageIcon(props)}
        {storageStatusMessage(props)}
      </Menu.Item>
      {props.storage.mode !== 'GOOGLE_DRIVE' ?
        <Menu.Item>
          <Button
            onClick={props.storeInGoogleDrive}
            icon='google drive'
            color='orange'
            content='Store in Google Drive'
          />
        </Menu.Item> : null
      }
      <Menu.Menu position={'right'}>
        <Menu.Item>
          <Button
            onClick={props.onExportClick}
            icon='download'
            basic
            color='black'
            content='Download / Export'
          />
        </Menu.Item>
        {props.storage.mode === 'GOOGLE_DRIVE' ?
          <Menu.Item>
            <Button
              onClick={() => openShareDialog(props.storage)}
              icon='users'
              color='orange'
              content='Share'
            />
          </Menu.Item> : null}
        <Menu.Item
          title="Open/Close Inspector"
          onClick={props.showInspector}>
          <Icon name='sidebar'/>
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  )
}

export default Header
