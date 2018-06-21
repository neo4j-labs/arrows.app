import {connect} from 'react-redux'
import {createNode} from '../actions/graph'
import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import Header from '../components/Header'

const mapStateToProps = state => {
  return {
    storageStatus: state.storageStatus
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onPlusNodeClick: () => {
      dispatch(createNode())
    },
    onReloadGraphClick: () => {
      dispatch(fetchGraphFromDatabase())
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer