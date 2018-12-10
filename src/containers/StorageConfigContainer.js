import {connect} from "react-redux"
import EditConnectionParametersForm from "../components/StorageConfigModal";
import {initializeConnection} from "../actions/databaseConnection";
import {initializeGoogleDriveStorage} from "../actions/googleDrive";

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {
    useNeo4jDatabaseStorage: () => {
      dispatch(initializeConnection())
    },
    useGoogleDriveStorage: () => {
      dispatch(initializeGoogleDriveStorage())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditConnectionParametersForm)