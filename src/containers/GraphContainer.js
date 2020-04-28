import {connect} from "react-redux"
import GraphDisplay from "../components/GraphDisplay"
import {compose} from "recompose"
import withKeyBindings from "../interactions/Keybindings"
import {
  getVisualGraph,
  getTransformationHandles
} from "../selectors/index"
import {deleteSelection, duplicateSelection, setRelationshipType, trySetNodeCaption} from "../actions/graph"
import {selectAll, jumpToNextNode} from "../actions/selection";
import {computeCanvasSize} from "../model/applicationLayout";
import { ActionCreators as UndoActionCreators } from 'redux-undo'

const mapStateToProps = state => {
  return {
    visualGraph: getVisualGraph(state),
    selection: state.selection,
    gestures: state.gestures,
    guides: state.guides,
    handles: getTransformationHandles(state),
    canvasSize: computeCanvasSize(state.applicationLayout),
    viewTransformation: state.viewTransformation,
    storage: state.storage
  }
}

const mapDispatchToProps = dispatch => ({
  duplicateSelection: () => dispatch(duplicateSelection()),
  deleteSelection: () => dispatch(deleteSelection()),
  selectAll: () => dispatch(selectAll()),
  jumpToNextNode: (direction, extraKeys) => dispatch(jumpToNextNode(direction, extraKeys)),
  undo: () => dispatch(UndoActionCreators.undo()),
  redo: () => dispatch(UndoActionCreators.redo()),
  dispatch: dispatch
})

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withKeyBindings
)(GraphDisplay)