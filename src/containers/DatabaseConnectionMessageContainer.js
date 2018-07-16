import {connect} from "react-redux"
import DatabaseConnectionMessage from "../components/DatabaseConnectionMessage";

const mapStateToProps = state => {
  return {
    connectionParameters: state.databaseConnection.connectionParameters,
    errorMsg: state.databaseConnection.errorMsg,
  }
}

export default connect(
  mapStateToProps,
  null
)(DatabaseConnectionMessage)