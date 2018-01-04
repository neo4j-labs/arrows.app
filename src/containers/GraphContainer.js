import {connect} from 'react-redux'
import GraphDisplay from '../components/GraphDisplay'
import {headerHeight} from '../components/Header'
import {windowResized} from "../actions/windowSize";
import {pan, zoom} from "../actions/viewTransformation";
import {moveNode} from "../actions/graph";

const mapStateToProps = state => {
  return {
    graph: state.graph,
    canvasSize: state.windowSize.relative(0, -headerHeight),
    viewTransformation: state.viewTransformation
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onWindowResized: () => dispatch(windowResized(window.innerWidth, window.innerHeight)),
    zoom: (scale) => dispatch(zoom(scale)),
    pan: (offset) => dispatch(pan(offset)),
    moveNode: (node, position) => dispatch(moveNode(node, position))
  }
}

const GraphContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphDisplay)

export default GraphContainer