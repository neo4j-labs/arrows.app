import {connect} from 'react-redux'
import GraphDisplay from '../components/GraphDisplay'
import {headerHeight} from '../components/Header'
import {windowResized} from "../actions/windowSize";
import {pan, zoom} from "../actions/viewTransformation";
import {endDrag, tryMoveNode} from "../actions/graph";
import {activateRing, deactivateRing, tryDragRing} from "../actions/gestures";
import { modifyGraph } from "../actions/neo4jStorage";

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
    endDrag: () => dispatch(modifyGraph(endDrag())),
    activateRing: (nodeId) => dispatch(activateRing(nodeId)),
    deactivateRing: () => dispatch(deactivateRing()),
    ringDragged: (nodeId, originalPosition, position) => dispatch(tryDragRing(nodeId, originalPosition, position))
  }
}

const GraphContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphDisplay)

export default GraphContainer