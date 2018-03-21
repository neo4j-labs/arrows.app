import {connect} from 'react-redux'
import GraphDisplay from '../components/GraphDisplay'
import {headerHeight} from '../components/Header'
import {windowResized} from "../actions/windowSize";
import {pan, zoom} from "../actions/viewTransformation";
import { deleteSelection, endDrag, tryMoveNode } from "../actions/graph";
import {
  activateRing, deactivateRing, tryDragRing, toggleSelection, tryUpdateSelectionPath,
  removeSelectionPath, updateMarquee, endMarquee
} from "../actions/gestures";
import { toggleInspector } from "../actions/sidebar";
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
    toggleInspector: (node) => dispatch(toggleInspector(node.id)),
    toggleSelection: (entity, additive) => dispatch(toggleSelection(entity, additive)),
    selectionPathUpdated: (position, isDoubleClick) => dispatch(tryUpdateSelectionPath(position, isDoubleClick)),
    removeSelectionPath: () => dispatch(removeSelectionPath()),
    marqueeDragged: (from, to) => dispatch(updateMarquee(from, to)),
    marqueeEnded: (from, to) => dispatch(endMarquee(from, to)),
    deleteSelection: () => dispatch(deleteSelection())
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withKeyBindings
)(GraphDisplay)