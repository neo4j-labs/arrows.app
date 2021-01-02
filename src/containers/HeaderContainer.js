import {connect} from 'react-redux'
import Header from '../components/Header'
import {toggleInspector} from "../actions/applicationLayout";
import {renameDiagram} from "../actions/diagramName";
import {showExportDialog, showHelpDialog, showImportDialog} from "../actions/applicationDialogs";
import {
  newGoogleDriveDiagram,
  newLocalStorageDiagram,
  openRecentFile,
  pickDiagram,
  postCurrentDiagramAsNewFileOnGoogleDrive
} from "../actions/storage";

const mapStateToProps = state => {
  return {
    recentStorage: state.recentStorage.slice(1,11),
    diagramName: state.diagramName,
    storage: state.storage
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onNewDiagram: (mode) => {
      switch (mode) {
        case 'GOOGLE_DRIVE':
          dispatch(newGoogleDriveDiagram())
          break
        case 'LOCAL_STORAGE':
          dispatch(newLocalStorageDiagram())
          break
      }
    },
    pickFileToOpen: (mode) => {
      dispatch(pickDiagram(mode))
    },
    openRecentFile: (entry) => {
      dispatch(openRecentFile(entry))
    },
    setDiagramName: (diagramName) => {
      dispatch(renameDiagram(diagramName))
    },
    showInspector: () => {
      dispatch(toggleInspector())
    },
    onExportClick: () => {
      dispatch(showExportDialog())
    },
    storeInGoogleDrive: () => {
      dispatch(postCurrentDiagramAsNewFileOnGoogleDrive())
    },
    onImportClick: () => {
      dispatch(showImportDialog())
    },
    onHelpClick: () => {
      dispatch(showHelpDialog())
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer
