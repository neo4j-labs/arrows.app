import {connect} from 'react-redux'
import {createNode} from '../actions/graph'
import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import Header from '../components/Header'
import {editConnectionParameters} from "../actions/databaseConnection";
import {showInspector} from "../actions/applicationLayout";
import {saveGraphToGoogleDrive} from "../actions/googleDrive";

const mapStateToProps = state => {
  return {
    connectionParametersEditable: state.databaseConnection.connectionParametersEditable,
    storageStatus: state.storage.status,
    fileId: state.storage.fileId
  }
}

const mapDispatchToProps = dispatch => {
  return {
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
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer