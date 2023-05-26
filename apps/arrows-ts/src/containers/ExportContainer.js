import {connect} from "react-redux"
import ExportModal from "../components/ExportModal";
import {hideExportDialog} from "../actions/applicationDialogs";
import { getPresentGraph } from "../selectors"

const mapStateToProps = state => {
  return {
    graph: getPresentGraph(state),
    cachedImages: state.cachedImages,
    diagramName: state.diagramName
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onCancel: () =>{
      dispatch(hideExportDialog())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExportModal)