import {connect} from "react-redux";
import {setGraphStyle} from "../actions/graph";
import GeneralInspector from "../components/GeneralInspector";
import { getPresentGraph } from "../selectors"

const mapStateToProps = state => {
  return {
    graph: getPresentGraph(state),
    selection: state.selection,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSaveGraphStyle: (key, value) => dispatch(setGraphStyle(key, value)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GeneralInspector)