import {connect} from "react-redux"
import EditConnectionParametersForm from "../components/StorageConfigModal";
import {initializeConnection} from "../actions/databaseConnection";
import {initializeGoogleDriveStorage} from "../actions/googleDrive";
import {useLocalStorage} from "../actions/storage";
import { openDiagram } from "../actions/diagram"
import { loadGraphFromLocalStorage } from "../actions/localStorage"

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
      dispatch(useLocalStorage())
      dispatch(loadGraphFromLocalStorage())
    }
  }
}

export default connect(
  null,
  mapDispatchToProps
)(EditConnectionParametersForm)
