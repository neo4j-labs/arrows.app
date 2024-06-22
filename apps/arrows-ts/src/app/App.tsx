import React, { Component } from 'react';
import GraphContainer from '../containers/GraphContainer';
import { connect } from 'react-redux';
import withKeybindings, { ignoreTarget } from '../interactions/Keybindings';
import { windowResized } from '../actions/applicationLayout';
import HeaderContainer from '../containers/HeaderContainer';
import InspectorChooser from '../containers/InspectorChooser';
import { computeCanvasSize, inspectorWidth } from '@neo4j-arrows/model';
import ExportContainer from '../containers/ExportContainer';
import GoogleSignInModal from '../components/editors/GoogleSignInModal';
import HelpModal from '../components/HelpModal';
import GoogleDrivePicker from '../components/GoogleDrivePickerWrapper';
import { getFileFromGoogleDrive, pickDiagramCancel } from '../actions/storage';
import FooterContainer from '../containers/FooterContainer';
import LocalStoragePickerContainer from '../containers/LocalStoragePickerContainer';
import SaveAsContainer from '../containers/SaveAsContainer';
import ImportContainer from '../containers/ImportContainer';
import { handlePaste } from '../actions/import';
import { handleCopy } from '../actions/export';
import { linkToGoogleFontsCss } from '../graphics/utils/fontWrangling';
import { handleImportMessage } from '../reducers/storage';

import './App.css';

export interface AppProps {
  inspectorVisible: boolean;
  showSaveAsDialog: boolean;
  showExportDialog: boolean;
  showImportDialog: boolean;
  pickingFromGoogleDrive: boolean;
  pickingFromLocalStorage: boolean;
  onCancelPicker: any;
  loadFromGoogleDrive: any;
  canvasHeight: number;
  fireAction: any;
  handleCopy: (ev: ClipboardEvent) => void;
  handlePaste: (ev: ClipboardEvent) => void;
  handleImportMessage: (ev: MessageEvent<any>) => void;
  onWindowResized: (this: Window, ev: UIEvent) => any;
}

class App extends Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
    linkToGoogleFontsCss();
    window.addEventListener(
      'keydown',
      this.fireKeyboardShortcutAction.bind(this)
    );
    window.addEventListener('copy', this.handleCopy.bind(this));
    window.addEventListener('paste', this.handlePaste.bind(this));
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  render() {
    const {
      inspectorVisible,
      showSaveAsDialog,
      showExportDialog,
      showImportDialog,
      pickingFromGoogleDrive,
      pickingFromLocalStorage,
      onCancelPicker,
      loadFromGoogleDrive,
    } = this.props;

    const saveAsModal = showSaveAsDialog ? <SaveAsContainer /> : null;
    const exportModal = showExportDialog ? <ExportContainer /> : null;
    const importModal = showImportDialog ? <ImportContainer /> : null;
    const googleDriveModal = pickingFromGoogleDrive ? (
      <GoogleDrivePicker
        onCancelPicker={onCancelPicker}
        onFilePicked={loadFromGoogleDrive}
      />
    ) : null;
    const localStorageModal = pickingFromLocalStorage ? (
      <LocalStoragePickerContainer />
    ) : null;

    const inspector = inspectorVisible ? (
      <aside
        style={{
          width: inspectorWidth,
          height: this.props.canvasHeight,
          overflowY: 'scroll',
          borderLeft: '1px solid #D4D4D5',
        }}
      >
        <InspectorChooser />
      </aside>
    ) : null;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          margin: 0,
        }}
      >
        {saveAsModal}
        {exportModal}
        {importModal}
        {googleDriveModal}
        {localStorageModal}
        <GoogleSignInModal />
        <HelpModal />
        <HeaderContainer />
        <section
          style={{
            flex: 2,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <GraphContainer />
          {inspector}
        </section>
        <FooterContainer />
      </div>
    );
  }

  fireKeyboardShortcutAction(ev: KeyboardEvent) {
    if (ignoreTarget(ev)) return;

    const handled = this.props.fireAction(ev);
    if (handled) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  handleCopy(ev: ClipboardEvent) {
    if (ignoreTarget(ev)) return;
    console.log('copying');
    this.props.handleCopy(ev);
  }

  handlePaste(ev: ClipboardEvent) {
    if (ignoreTarget(ev)) return;
    this.props.handlePaste(ev);
  }

  handleMessage(ev: MessageEvent<any>) {
    this.props.handleImportMessage(ev);
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResized);
  }
}

const mapStateToProps = (state: any) => ({
  inspectorVisible: state.applicationLayout.inspectorVisible,
  canvasHeight: computeCanvasSize(state.applicationLayout).height,
  pickingFromGoogleDrive: state.storage.status === 'PICKING_FROM_GOOGLE_DRIVE',
  pickingFromLocalStorage:
    state.storage.status === 'PICKING_FROM_LOCAL_STORAGE',
  showSaveAsDialog: state.applicationDialogs.showSaveAsDialog,
  showExportDialog: state.applicationDialogs.showExportDialog,
  showImportDialog: state.applicationDialogs.showImportDialog,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    onWindowResized: () =>
      dispatch(windowResized(window.innerWidth, window.innerHeight)),
    onCancelPicker: () => dispatch(pickDiagramCancel()),
    loadFromGoogleDrive: (fileId: any) =>
      dispatch(getFileFromGoogleDrive(fileId)),
    handleCopy: () => dispatch(handleCopy()),
    handlePaste: (clipboardEvent: any) => dispatch(handlePaste(clipboardEvent)),
    handleImportMessage: (message: any) =>
      dispatch(handleImportMessage(message)),
  };
};

// NOTE: compose(a,b,c)(X) ==[BECOMES]=> a(b(c(X)))
// export default compose(
//   connect(mapStateToProps, mapDispatchToProps),
//   withKeybindings
// )(App)
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withKeybindings(App));
