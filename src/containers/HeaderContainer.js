import {connect} from 'react-redux'
import {createNode} from '../actions/graph'
import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import Header from '../components/Header'
import {editConnectionParameters} from "../actions/databaseConnection";
import {showInspector} from "../actions/applicationLayout";
import {saveGraphToGoogleDrive} from "../actions/googleDrive";
import {setDiagramName} from "../actions/diagramName";
import {showExportDialog} from "../actions/exporting";

const mapStateToProps = state => {
  return {
    diagramName: state.diagramName,
    connectionParametersEditable: state.databaseConnection.connectionParametersEditable,
    storageStatus: state.storage.status,
    storage: state.storage
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setDiagramName: (diagramName) => {
      dispatch(setDiagramName(diagramName))
    },
    showInspector: () => {
      dispatch(showInspector())
    },
    onPlusNodeClick: () => {
      dispatch(createNode())
    },
    onReloadGraphClick: () => {
      dispatch(fetchGraphFromDatabase())
    },
    onEditConnectionParameters: () => {
      dispatch(editConnectionParameters())
    },
    onGoogleDriveClick: () => {
      dispatch(saveGraphToGoogleDrive())
    },
    onExportClick: () => {
      dispatch(showExportDialog())
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer