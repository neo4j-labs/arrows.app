import {connect} from "react-redux";
import {createNode, setGraphStyle} from "../actions/graph";
import GeneralInspector from "../components/GeneralInspector";
import { getPresentGraph } from "../selectors"
import {showStyleDialog} from "../actions/applicationDialogs";

const mapStateToProps = state => {
  return {
    graph: getPresentGraph(state),
    cachedImages: state.cachedImages,
    selection: state.selection,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onShowStyleDialog: () => {
      dispatch(showStyleDialog())
    },
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