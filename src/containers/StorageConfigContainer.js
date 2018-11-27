import {connect} from "react-redux"
import EditConnectionParametersForm from "../components/StorageConfigModal";
import {
  hideStorageConfig, forgetConnectionParameters, updateConnectionParameters,
  initializeConnection
} from "../actions/databaseConnection";
import { fetchGraphFromDrive } from "../storage/googleDriveStorage";
import { saveGraphToGoogleDrive } from "../actions/googleDrive";
import {useGoogleDriveStorage} from "../actions/storage";

const mapStateToProps = state => {
  return {
    connectionParameters: state.storage.database.connectionParameters,
    errorMsg: state.storage.database.errorMsg
  }
}

const mapDispatchToProps = dispatch => {
  return {
    useNeo4jDatabaseStorage: () => {
      dispatch(initializeConnection())
    },
    useGoogleDriveStorage: () => {
      dispatch(useGoogleDriveStorage())
    },
    onConnectionParametersUpdated: (connectionParameters) => {
      dispatch(updateConnectionParameters(connectionParameters))
    },
    onCancel: () =>{
      dispatch(hideStorageConfig())
    },
    forgetConnectionParameters: forgetConnectionParameters,
    onFilePicked: fileId => {
      dispatch(useGoogleDriveStorage(fileId))
      dispatch(fetchGraphFromDrive(fileId))
      dispatch(hideStorageConfig())
    },
    saveToDrive: () => {
      dispatch(saveGraphToGoogleDrive())
      dispatch(hideStorageConfig())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditConnectionParametersForm)