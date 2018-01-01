import { connect } from 'react-redux'
import GraphDisplay from '../components/GraphDisplay'

const mapStateToProps = state => {
  return {
    graph: state.graph
  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

const GraphContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphDisplay)

export default GraphContainer