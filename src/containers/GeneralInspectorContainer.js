import {connect} from "react-redux";
import {setGraphStyle} from "../actions/graph";
import GeneralInspector from "../components/GeneralInspector";
import {hideInspector, showInspector, setBetaFeaturesEnabled} from "../actions/applicationLayout";

const mapStateToProps = state => {
  return {
    graph: state.graph,
    selection: state.selection,
    betaFeaturesEnabled: state.applicationLayout.betaFeaturesEnabled
  }
}

const mapDispatchToProps = dispatch => {
  return {
    hideInspector: () => dispatch(hideInspector()),
    showInspector: () => dispatch(showInspector()),
    onSaveGraphStyle: (key, value) => dispatch(setGraphStyle(key, value)),
    onSetBetaFeaturesEnabled: enabled => dispatch(setBetaFeaturesEnabled(enabled))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GeneralInspector)