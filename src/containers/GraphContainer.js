import {connect} from "react-redux"
import GraphDisplay from "../components/GraphDisplay"
import {compose} from "recompose"
import withKeyBindings from "../interactions/Keybindings"
import {windowResized} from "../actions/applicationLayout"
import {getVisualGraph} from "../selectors/index"
import {deleteSelection} from "../actions/graph"
import {removeSelectionPath} from "../actions/selectionPath"
import {selectAll} from "../actions/selection";

const mapStateToProps = state => {
  return {
    visualGraph: getVisualGraph(state),
    selection: state.selection,
    gestures: state.gestures,
    guides: state.guides,
    canvasSize: state.applicationLayout.windowSize,
    viewTransformation: state.viewTransformation
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onWindowResized: (width, height) => dispatch(windowResized(width, height)),
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