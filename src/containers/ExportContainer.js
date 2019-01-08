import {connect} from "react-redux"
import ExportModal from "../components/ExportModal";
import {hideExportDialog} from "../actions/applicationDialogs";

const mapStateToProps = state => {
  return {
    graph: state.graph,
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