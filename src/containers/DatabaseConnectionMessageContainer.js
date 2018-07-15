import {connect} from "react-redux"
import DatabaseConnectionMessage from "../components/DatabaseConnectionMessage";

const mapStateToProps = state => {
  return {
    connectionParameters: state.storageConfiguration.databaseConnectionParameters,
    errorMsg: state.storageConfiguration.errorMsg,
  }
}

export default connect(
  mapStateToProps,
  null
)(DatabaseConnectionMessage)