import { connect } from 'react-redux'
import { createNode } from '../actions'
import Header from '../components/Header'

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {
    onPlusNodeClick: () => {
      dispatch(createNode())
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer