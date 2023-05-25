import {connect} from "react-redux"
import SaveAsModal from "../components/SaveAsModal";
import {hideSaveAsDialog} from "../actions/applicationDialogs";
import {saveAsNewDiagram} from "../actions/storage";

const mapStateToProps = (state) => {
  return {
    diagramName: state.diagramName
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCreate: (newDiagramName) => {
      dispatch(hideSaveAsDialog())
      dispatch(saveAsNewDiagram(newDiagramName))
    },
    onCancel: () => {
      dispatch(hideSaveAsDialog())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SaveAsModal)