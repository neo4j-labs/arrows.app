import {connect} from "react-redux"
import EditConnectionParametersForm from "../components/EditConnectionParametersForm";
import {cancelEditing, forgetConnectionParameters, updateConnectionParameters} from "../actions/databaseConnection";
import { fetchGraphFromDrive } from "../storage/googleDriveStorage";
import { saveGraphToGoogleDrive } from "../actions/googleDrive";
import { setStorage } from "../actions/storage";

const mapStateToProps = state => {
  return {
    connectionParameters: state.databaseConnection.connectionParameters,
    errorMsg: state.databaseConnection.errorMsg,
    fileId: state.storage.fileId
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onConnectionParametersUpdated: (connectionParameters) => {
      dispatch(updateConnectionParameters(connectionParameters))
    },
    onCancel: () =>{
      dispatch(cancelEditing())
    },
    forgetConnectionParameters: forgetConnectionParameters,
    onFilePicked: fileId => {
      dispatch(setStorage('googleDrive', fileId))
      dispatch(fetchGraphFromDrive(fileId))
      dispatch(cancelEditing())
    },
    saveToDrive: (fileName, update) => {
      dispatch(saveGraphToGoogleDrive(fileName, update))
      dispatch(cancelEditing())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditConnectionParametersForm)