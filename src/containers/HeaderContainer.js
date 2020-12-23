import {connect} from 'react-redux'
import Header from '../components/Header'
import {toggleInspector} from "../actions/applicationLayout";
import {setDiagramName} from "../actions/diagramName";
import {showExportDialog, showHelpDialog} from "../actions/applicationDialogs";
import {
  newGoogleDriveDiagram,
  newLocalStorageDiagram,
  pickDiagram,
  storeCurrentDiagramAsNewFileOnGoogleDrive
} from "../actions/storage";

const mapStateToProps = state => {
  return {
    diagramName: state.diagramName,
    storageStatus: state.storageStatus,
    storage: state.storage
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onNewGoogleDriveDiagram: () => {
      dispatch(newGoogleDriveDiagram())
    },
    onNewLocalStorageDiagram: () => {
      dispatch(newLocalStorageDiagram())
    },
    pickFromGoogleDrive: () => {
      dispatch(pickDiagram())
    },
    setDiagramName: (diagramName) => {
      dispatch(setDiagramName(diagramName))
    },
    showInspector: () => {
      dispatch(toggleInspector())
    },
    onExportClick: () => {
      dispatch(showExportDialog())
    },
    storeInGoogleDrive: () => {
      dispatch(storeCurrentDiagramAsNewFileOnGoogleDrive())
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
