import {connect} from "react-redux"
import EditConnectionParametersForm from "../components/StorageConfigModal";
import {initializeConnection} from "../actions/databaseConnection";
import {initializeGoogleDriveStorage} from "../actions/googleDrive";
import {usingLocalStorage} from "../actions/storage";
import { openDiagram } from "../actions/diagram"

const mapDispatchToProps = dispatch => {
  return {
    useNeo4jDatabaseStorage: () => {
      dispatch(initializeConnection())
    },
    useGoogleDriveStorage: () => {
      dispatch(initializeGoogleDriveStorage())
    },
    pickFromGoogleDrive: () => {
      dispatch(openDiagram())
    },
    useLocalStorage: () => {
      dispatch(usingLocalStorage())
    }
  }
}

export default connect(
  null,
  mapDispatchToProps
)(EditConnectionParametersForm)
