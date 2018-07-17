import {connect} from "react-redux"
import EditConnectionParametersForm from "../components/EditConnectionParametersForm";
import {cancelEditing, forgetConnectionParameters, updateConnectionParameters} from "../actions/databaseConnection";

const mapStateToProps = state => {
  return {
    connectionParameters: state.databaseConnection.connectionParameters,
    errorMsg: state.databaseConnection.errorMsg
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
)(EditConnectionParametersForm)