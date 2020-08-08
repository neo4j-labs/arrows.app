import {connect} from "react-redux";
import {createNode, setGraphStyle} from "../actions/graph";
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
    onSaveGraphStyle: (key, value) => {
      dispatch(setGraphStyle(key, value))
    },
    onPlusNodeClick: () => {
      dispatch(createNode())
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GeneralInspector)