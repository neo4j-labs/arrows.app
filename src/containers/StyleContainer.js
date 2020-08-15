import {connect} from "react-redux"
import StyleModal from "../components/StyleModal";
import {hideStyleDialog} from "../actions/applicationDialogs";

const mapStateToProps = _ => {
  return {
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onCancel: () =>{
      dispatch(hideStyleDialog())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StyleModal)