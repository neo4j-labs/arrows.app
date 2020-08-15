import {connect} from "react-redux"
import StyleModal from "../components/StyleModal";
import {hideStyleDialog} from "../actions/applicationDialogs";
import {setGraphStyles} from "../actions/graph";

const mapStateToProps = _ => {
  return {
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onCancel: () =>{
      dispatch(hideStyleDialog())
    },
    onApplyTheme: (style) => {
      dispatch(setGraphStyles(style))
      dispatch(hideStyleDialog())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StyleModal)