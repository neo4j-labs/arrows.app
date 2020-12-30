import {connect} from "react-redux"
import ImportModal from "../components/ImportModal";
import {hideImportDialog} from "../actions/applicationDialogs";
import {constructGraphFromFile} from "../storage/googleDriveStorage";
import {gettingGraphSucceeded} from "../actions/storage";

const mapStateToProps = () => {
  return {
  }
}

const mapDispatchToProps = dispatch => {
  return {
    tryImport: (text) => {
      let graphData

      try {
        const object = JSON.parse(text)
        graphData = constructGraphFromFile(object)
      } catch (e) {
        return {
          errorMessage: e.toString()
        }
      }

      dispatch(gettingGraphSucceeded(graphData.graph))
      dispatch(hideImportDialog())
      return {}
    },
    onCancel: () =>{
      dispatch(hideImportDialog())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportModal)