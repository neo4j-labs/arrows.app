import {connect} from "react-redux"
import DatabaseConnectionForm from "../components/DatabaseConnectionForm";
import {cancelEditing, updateConnectionParameters} from "../actions/databaseConnection";

const mapStateToProps = state => {
  return {
    open: state.storageConfiguration.editingStorageConfiguration,
    connectionParameters: state.storageConfiguration.databaseConnectionParameters,
    errorMsg: state.storageConfiguration.errorMsg
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onConnectionParametersUpdated: (connectionParameters) => {
      dispatch(updateConnectionParameters(connectionParameters))
    },
    onCancel: () =>{
      dispatch(cancelEditing())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatabaseConnectionForm)