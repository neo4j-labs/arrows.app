import {connect} from 'react-redux'
import GraphDisplay from '../components/GraphDisplay'
import {headerHeight} from '../components/Header'
import {windowResized} from "../actions/windowSize";
import {pan, zoom} from "../actions/viewTransformation";
import { endDrag, tryMoveNode } from "../actions/graph";
import {
  activateRing, deactivateRing, tryDragRing, toggleSelection, tryUpdateSelectionPath,
  removeSelectionPath, REMOVE_SELECTION_PATH, updateMarquee, endMarquee
} from "../actions/gestures";
import { editNode, editRelationship } from "../actions/sidebar";
import { compose } from "recompose";
import withKeyBindings from "../interactions/Keybindings";

const mapStateToProps = state => {
  return {
    graph: state.graph,
    gestures: state.gestures,
    guides: state.guides,
    canvasSize: state.windowSize.relative(0, -headerHeight),
    viewTransformation: state.viewTransformation
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onWindowResized: () => dispatch(windowResized(window.innerWidth, window.innerHeight)),
    zoom: (scale) => dispatch(zoom(scale)),
    pan: (offset) => dispatch(pan(offset)),
    moveNode: (nodeId, vector) => dispatch(tryMoveNode(nodeId, vector)),
    endDrag: () => dispatch(endDrag()),
    activateRing: (nodeId) => dispatch(activateRing(nodeId)),
    deactivateRing: () => dispatch(deactivateRing()),
    ringDragged: (nodeId, position) => dispatch(tryDragRing(nodeId, position)),
    editNode: (node) => dispatch(editNode(node.id)),
    toggleSelection: (nodeId, addative) => dispatch(toggleSelection(nodeId, addative)),
    editRelationship: (relationship) => dispatch(editRelationship(relationship.id)),
    selectionPathUpdated: (position, isDoubleClick) => dispatch(tryUpdateSelectionPath(position, isDoubleClick)),
    removeSelectionPath: () => dispatch(removeSelectionPath()),
    marqueeDragged: (from, to) => dispatch(updateMarquee(from, to)),
    marqueeEnded: (from, to) => dispatch(endMarquee(from, to)),
  }
}

const keybindings = [
  {
    name: REMOVE_SELECTION_PATH,
    handler: ({ removeSelectionPath }) => removeSelectionPath
  }
]

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withKeyBindings
)(GraphDisplay)