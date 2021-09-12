import React, {PureComponent} from 'react'
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
      POSTING: `Saving to ${storageName}...`,
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

const storageIcon = (storageMode) => {
  switch (storageMode) {
    case 'DATABASE':
      return 'database'

    case 'GOOGLE_DRIVE':
      return 'google drive'

    case 'LOCAL_STORAGE':
      return 'window maximize outline'

    default:
      return 'square outline'
  }
}

class Header extends PureComponent {
  constructor(props) {
    super(props)
  }

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   console.log(this.props.storage, nextProps.storage,
  //     this.props.storage !== nextProps.storage
  //   )
  //   return (
  //     this.props.recentStorage !== nextProps.recentStorage ||
  //     this.props.diagramName !== nextProps.diagramName ||
  //     this.props.storage !== nextProps.storage
  //   )
  // }

  render() {
    const openShareDialog = storage => {
      new GoogleDriveShare(storage).openDialog()
    }

    const newDiagramOptions = ['GOOGLE_DRIVE', 'LOCAL_STORAGE'].map(mode => (
      <div key={mode} role="option" className="item" onClick={() => this.props.onNewDiagram(mode)}>
        <i aria-hidden="true" className={'icon ' + storageIcon(mode)}/>
        <span>{storageNames[mode]}</span>
      </div>
    ))

    const recentlyAccessFiles = this.props.recentStorage.slice(1,11).map((entry, i) => (
      <div key={'recentlyAccessFiles' + i} role="option" className="item" onClick={() => this.props.openRecentFile(entry)}
           style={{
             maxWidth: '20em',
             overflow: 'hidden',
             whiteSpace: 'nowrap',
             textOverflow: 'ellipsis'
           }}>
        <i aria-hidden="true" className={'icon ' + storageIcon(entry.mode)}/>
        <span className="text">{entry.diagramName}</span>
      </div>
    ))

    const browseDiagramOptions = ['GOOGLE_DRIVE', 'LOCAL_STORAGE'].map(mode => (
      <div key={mode} role="option" className="item" onClick={() => this.props.pickFileToOpen(mode)}>
        <i aria-hidden="true" className={'icon ' + storageIcon(mode)}/>
        <span>{storageNames[mode]}</span>
      </div>
    ))

    return (
      <Menu attached='top' style={{borderRadius: 0}} borderless>
        <div role="listbox" aria-expanded="true" className="ui item simple dropdown" tabIndex="0">
          <i className="icon" style={{height: '1.5em'}}>
            <img src={arrows_logo} style={{height: '1.5em'}} alt='Arrows.app logo'/>
          </i>
          <div className="menu transition visible">
            <div role="option" className="item">
              <i aria-hidden="true" className="dropdown icon"/>
              <span className="text">New</span>
              <div className="menu transition">
                <div className="header">Store in</div>
                {newDiagramOptions}
              </div>
            </div>
            <div role="option" className="item">
              <i aria-hidden="true" className="dropdown icon"/>
              <span className="text">Open</span>
              <div className="menu transition">
                <div className="header">Recently accessed</div>
                {recentlyAccessFiles}
                <div className="divider"/>
                <div className="header">Browse</div>
                {browseDiagramOptions}
              </div>
            </div>
            <div className="divider"/>
            <div role="option" className="item" onClick={this.props.onImportClick}>Import</div>
            <div className="divider"/>
            <div role="option" className="item" onClick={this.props.onHelpClick}>Help</div>
          </div>
        </div>
        <DiagramNameEditor
          diagramName={this.props.diagramName}
          setDiagramName={this.props.setDiagramName}
        />
        <Menu.Item style={{opacity: 0.6}}>
          <Icon name={storageIcon(this.props.storage.mode)}/>
          {storageStatusMessage(this.props)}
        </Menu.Item>
        <Menu.Menu position={'right'}>
          <Menu.Item>
            <Button
              onClick={this.props.onExportClick}
              icon='download'
              basic
              color='black'
              content='Download / Export'
            />
          </Menu.Item>
          {this.props.storage.mode === 'GOOGLE_DRIVE' ?
            <Menu.Item>
              <Button
                onClick={() => openShareDialog(this.props.storage)}
                icon='users'
                color='orange'
                content='Share'
              />
            </Menu.Item> :
            <Menu.Item>
              <Button
                onClick={this.props.storeInGoogleDrive}
                icon='google drive'
                color='orange'
                content='Save to Google Drive'
              />
            </Menu.Item>
          }
          <Menu.Item
            title="Open/Close Inspector"
            onClick={this.props.showInspector}>
            <Icon name='sidebar'/>
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    )
  }
}

export default Header
