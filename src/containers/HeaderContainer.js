import {connect} from 'react-redux'
import {createNode} from '../actions/graph'
import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import Header from '../components/Header'
import {editConnectionParameters} from "../actions/databaseConnection";

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
    },
    onEditStorageConfiguration: () => {
      dispatch(editConnectionParameters())
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer