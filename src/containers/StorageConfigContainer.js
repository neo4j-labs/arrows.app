import {connect} from "react-redux"
import EditConnectionParametersForm from "../components/StorageConfigModal";
import {initializeConnection} from "../actions/databaseConnection";
import {initializeGoogleDriveStorage} from "../actions/googleDrive";
import { initFromLocalStorage } from "../actions/localStorage"

const mapDispatchToProps = dispatch => {
  return {
    useNeo4jDatabaseStorage: () => {
      dispatch(initializeConnection())
    },
    useGoogleDriveStorage: () => {
      dispatch(initializeGoogleDriveStorage())
    },
    useLocalStorage: () => dispatch(initFromLocalStorage())
  }
}

export default connect(
  null,
  mapDispatchToProps
)(EditConnectionParametersForm)
