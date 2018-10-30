import {connect} from "react-redux";
import {setGraphStyle} from "../actions/graph";
import GeneralInspector from "../components/GeneralInspector";
import {hideInspector, showInspector} from "../actions/applicationLayout";

const mapStateToProps = state => {
  return {
    graph: state.graph,
    selection: state.selection,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    hideInspector: () => {
      dispatch(hideInspector())
    },
    showInspector: () => {
      dispatch(showInspector())
    },
    onSaveGraphStyle: (key, value) => {
      dispatch(setGraphStyle(key, value))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GeneralInspector)