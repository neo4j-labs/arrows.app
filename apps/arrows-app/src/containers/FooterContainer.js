import {connect} from 'react-redux'
import {showHelpDialog} from "../actions/applicationDialogs";
import Footer from "../components/Footer";

const mapStateToProps = () => {
  return {
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onHelpClick: () => {
      dispatch(showHelpDialog())
    }
  }
}

const FooterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Footer)

export default FooterContainer
