import React from 'react'
import { Icon, Menu, Button } from 'semantic-ui-react'
import { DiagramNameEditor } from "./DiagramNameEditor"
import arrows_logo from "../images/arrows_logo.svg"
import GoogleDriveShare from "./GoogleDriveShareWrapper"

const storageStatusMessage = (props) => {
  const storageNames = {
    LOCAL_STORAGE: 'Web Browser storage',
    GOOGLE_DRIVE: 'Google Drive'
  }
  const storageName = storageNames[props.storage.mode]
  if (storageName) {
    const statusMessages = {
      IDLE: `Saved to ${storageName}`,
      GETTING_GRAPH: `Saving to ${storageName}...`,
      GETTING_GRAPH_FAILED: `Failed to load from ${storageName}, see Javascript console for details.`,
      UPDATING_GRAPH: `Saving to ${storageName}...`,
      PUTTING_GRAPH_FAILED: `Failed to save to ${storageName}, see Javascript console for details.`
    }
    return (
      <span>{statusMessages[props.storageStatus.status]}</span>
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
      <Menu.Item style={{opacity: 0.6}}>
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
