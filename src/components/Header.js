import React from 'react'
import { Icon, Menu, Button } from 'semantic-ui-react'
import { DiagramNameEditor } from "./DiagramNameEditor"
import arrows_logo from "../images/arrows_logo.svg"
import GoogleDriveShare from "./GoogleDriveShareWrapper"

const storageNames = {
  LOCAL_STORAGE: 'Web Browser storage',
  GOOGLE_DRIVE: 'Google Drive'
}

const storageStatusMessage = (props) => {
  const storageName = storageNames[props.storage.mode]
  if (storageName) {
    const statusMessages = {
      READY: `Saved to ${storageName}`,
      GET: `Loading from ${storageName}`,
      GETTING: `Loading from ${storageName}`,
      PUT: `Unsaved changes`,
      PUTTING: `Saving to ${storageName}...`,
      FAILED: `Failed to save to ${storageName}, see Javascript console for details.`
    }
    return (
      <span>{statusMessages[props.storage.status] || ''}</span>
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
        <Icon name='window maximize outline'/>
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
              <div role="option" className="item" onClick={props.onNewGoogleDriveDiagram}>use {storageNames.GOOGLE_DRIVE}</div>
              <div role="option" className="item" onClick={props.onNewLocalStorageDiagram}>use {storageNames.LOCAL_STORAGE}</div>
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
          </Menu.Item> :
          <Menu.Item>
            <Button
              onClick={props.storeInGoogleDrive}
              icon='google drive'
              color='orange'
              content='Save to Google Drive'
            />
          </Menu.Item>
        }
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
