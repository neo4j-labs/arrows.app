import {connect} from "react-redux"
import ExportModal from "../components/ExportModal";
import {hideExportDialog} from "../actions/exporting";

const mapStateToProps = state => {
  return {
    graph: state.graph
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