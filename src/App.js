import React, {Component} from 'react'
import GraphContainer from "./containers/GraphContainer"
import {connect} from 'react-redux'
import './App.css'
import withKeybindings, { ignoreTarget } from './interactions/Keybindings'
import {windowResized} from "./actions/applicationLayout"
import { compose } from 'recompose'
import HeaderContainer from './containers/HeaderContainer'
import InspectorChooser from "./containers/InspectorChooser"
import {computeCanvasSize, inspectorWidth} from "./model/applicationLayout";
import ExportContainer from "./containers/ExportContainer";
import GoogleSignInModal from "./components/editors/GoogleSignInModal";
import HelpModal from "./components/HelpModal";
import GoogleDrivePicker from './components/GoogleDrivePickerWrapper'
import {getFileFromGoogleDrive, pickDiagramCancel} from "./actions/storage"
import FooterContainer from "./containers/FooterContainer";
import StyleContainer from "./containers/StyleContainer";
import LocalStoragePickerContainer from "./containers/LocalStoragePickerContainer";
import ImportContainer from "./containers/ImportContainer";
import {handlePaste} from "./actions/import";

class App extends Component {
  constructor (props) {
    super(props)
    window.onkeydown = this.fireKeyboardShortcutAction.bind(this)
    window.addEventListener('paste', this.props.handlePaste)
  }

  render() {
    const {
      inspectorVisible,
      showStyleDialog,
      showExportDialog,
      showImportDialog,
      pickingFromGoogleDrive,
      pickingFromLocalStorage,
      onCancelPicker,
      loadFromGoogleDrive
    } = this.props

    const styleModal = showStyleDialog ? (<StyleContainer/>) : null
    const exportModal = showExportDialog ? (<ExportContainer/>) : null
    const importModal = showImportDialog ? (<ImportContainer/>) : null
    const googleDriveModal = pickingFromGoogleDrive ? <GoogleDrivePicker onCancelPicker={onCancelPicker} onFilePicked={loadFromGoogleDrive} /> : null
    const localStorageModal = pickingFromLocalStorage ? <LocalStoragePickerContainer/> : null

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
        {styleModal}
        {exportModal}
        {importModal}
        {googleDriveModal}
        {localStorageModal}
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
  pickingFromGoogleDrive: state.storage.status === 'PICKING_FROM_GOOGLE_DRIVE',
  pickingFromLocalStorage: state.storage.status === 'PICKING_FROM_LOCAL_STORAGE',
  showStyleDialog: state.applicationDialogs.showStyleDialog,
  showExportDialog: state.applicationDialogs.showExportDialog,
  showImportDialog: state.applicationDialogs.showImportDialog
})


const mapDispatchToProps = dispatch => {
  return {
    onWindowResized: () => dispatch(windowResized(window.innerWidth, window.innerHeight)),
    onCancelPicker: () => dispatch(pickDiagramCancel()),
    loadFromGoogleDrive: fileId => dispatch(getFileFromGoogleDrive(fileId)),
    handlePaste: clipboardEvent => dispatch(handlePaste(clipboardEvent))
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withKeybindings
)(App)
