import {connect} from 'react-redux'
import GraphDisplay from '../components/GraphDisplay'
import {headerHeight} from '../components/Header'
import {windowResized} from "../actions/index";

const mapStateToProps = state => {
  return {
    graph: state.graph,
    canvasSize: state.windowSize.relative(0, -headerHeight)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onWindowResized: () => dispatch(windowResized(window.innerWidth, window.innerHeight))
  }
}

const GraphContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphDisplay)

export default GraphContainer