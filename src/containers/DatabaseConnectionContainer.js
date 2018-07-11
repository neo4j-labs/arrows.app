import {connect} from "react-redux"
import DatabaseConnectionForm from "../components/DatabaseConnectionForm";
import {cancelEditing, forgetConnectionParameters, updateConnectionParameters} from "../actions/databaseConnection";

const mapStateToProps = state => {
  return {
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
    },
    forgetConnectionParameters: forgetConnectionParameters
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatabaseConnectionForm)