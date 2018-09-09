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
    storage: state.storage
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
    saveToDrive: (fileName, nameChanged) => {
      dispatch(saveGraphToGoogleDrive(fileName, nameChanged))
      dispatch(cancelEditing())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditConnectionParametersForm)