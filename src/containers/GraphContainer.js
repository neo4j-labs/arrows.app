import {connect} from "react-redux"
import GraphDisplay from "../components/GraphDisplay"
import {compose} from "recompose"
import withKeyBindings from "../interactions/Keybindings"
import {getVisualGraph} from "../selectors/index"
import {deleteSelection} from "../actions/graph"
import {removeSelectionPath} from "../actions/selectionPath"
import {selectAll} from "../actions/selection";
import {computeCanvasSize} from "../model/applicationLayout";

const mapStateToProps = state => {
  return {
    visualGraph: getVisualGraph(state),
    selection: state.selection,
    gestures: state.gestures,
    guides: state.guides,
    canvasSize: computeCanvasSize(state.applicationLayout),
    viewTransformation: state.viewTransformation
  }
}

const mapDispatchToProps = dispatch => {
  return {
    removeSelectionPath: () => dispatch(removeSelectionPath()),
    deleteSelection: () => dispatch(deleteSelection()),
    selectAll: () => dispatch(selectAll()),
    dispatch: dispatch
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withKeyBindings
)(GraphDisplay)