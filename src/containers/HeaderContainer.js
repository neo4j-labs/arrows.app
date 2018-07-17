import {connect} from 'react-redux'
import {createNode} from '../actions/graph'
import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import Header from '../components/Header'
import {editConnectionParameters} from "../actions/databaseConnection";

const mapStateToProps = state => {
  return {
    connectionParametersEditable: state.databaseConnection.connectionParametersEditable,
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
    onEditConnectionParameters: () => {
      dispatch(editConnectionParameters())
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer