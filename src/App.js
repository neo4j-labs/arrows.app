import React, {Component} from 'react'
import GraphContainer from "./containers/GraphContainer"
import {connect} from 'react-redux'
import './App.css'
import withKeybindings, { ignoreTarget } from './interactions/Keybindings'
import {windowResized} from "./actions/applicationLayout"
import { compose } from 'recompose'
import HeaderContainer from './containers/HeaderContainer'
import InspectorChooser from "./containers/InspectorChooser"
import StorageConfigContainer from "./containers/StorageConfigContainer"
import DatabaseConnectionMessageContainer from "./containers/DatabaseConnectionMessageContainer"
import {computeCanvasSize, inspectorWidth} from "./model/applicationLayout";
import ExportContainer from "./containers/ExportContainer";
import GoogleSignInModal from "./components/editors/GoogleSignInModal";
import DatabaseConnectionContainer from "./containers/DatabaseConnectionContainer";
import HelpModal from "./components/HelpModal";
import GoogleDrivePicker from './components/GoogleDrivePickerWrapper'
import { newDiagram } from "./actions/diagram"
import { loadFromGoogleDriveFile } from "./actions/storage"
import FooterContainer from "./containers/FooterContainer";

class App extends Component {
  constructor (props) {
    super(props)
    window.onkeydown = this.fireKeyboardShortcutAction.bind(this)
  }

  render() {
    const {
      viewingConfig,
      inspectorVisible,
      editingConnectionParameters,
      showDisconnectedDialog,
      showExportDialog,
      viewingOpenDiagram,
      onCancelPicker,
      loadFromGoogleDrive
    } = this.props

    const storageConfigModal = viewingConfig ? (<StorageConfigContainer/>) : null
    const databaseConnectionModal = editingConnectionParameters ? (<DatabaseConnectionContainer/>) : null
    const databaseConnectionMessageModal = showDisconnectedDialog ? (<DatabaseConnectionMessageContainer/>) : null
    const exportModal = showExportDialog ? (<ExportContainer/>) : null
    const googleDriveModal = viewingOpenDiagram ? <GoogleDrivePicker onCancelPicker={onCancelPicker } onFilePicked={loadFromGoogleDrive} /> : null

    const inspector = inspectorVisible ? (
      <aside style={{
        width: inspectorWidth,
        height: this.props.canvasHeight,
        overflowY: 'scroll',
        borderLeft: '1px solid #D4D4D5',
      }}>
          <InspectorChooser/>
      </aside>
    ) : null

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        margin: 0
      }}>
        {storageConfigModal}
        {databaseConnectionModal}
        {databaseConnectionMessageModal}
        {exportModal}
        {googleDriveModal}
        <GoogleSignInModal/>
        <HelpModal/>
        <HeaderContainer/>
        <section style={{
          flex: 2,
          display: 'flex',
          flexDirection: 'row'
        }}>
          <GraphContainer/>
          {inspector}
        </section>
        <FooterContainer/>
      </div>
    );
  }

  fireKeyboardShortcutAction(ev) {
    if (ignoreTarget(ev)) return

    const handled = this.props.fireAction(ev)
    if (handled) {
      ev.preventDefault()
      ev.stopPropagation()
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResized)
  }
}

const mapStateToProps = (state) => ({
  inspectorVisible: state.applicationLayout.inspectorVisible,
  canvasHeight: computeCanvasSize(state.applicationLayout).height,
  viewingConfig: state.storage.mode === 'NONE',
  viewingOpenDiagram: state.storage.mode === 'OPEN_DIAGRAM',
  editingConnectionParameters: state.storage.database.editingConnectionParameters,
  showDisconnectedDialog: state.storage.database.showDisconnectedDialog,
  showExportDialog: state.applicationDialogs.showExportDialog
})


const mapDispatchToProps = dispatch => {
  return {
    onWindowResized: () => dispatch(windowResized(window.innerWidth, window.innerHeight)),
    onCancelPicker: () => dispatch(newDiagram()),
    loadFromGoogleDrive: fileId => loadFromGoogleDriveFile(dispatch, fileId)
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withKeybindings
)(App)
