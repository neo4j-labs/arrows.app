import {connect} from "react-redux";
import {setGraphStyle} from "../actions/graph";
import GeneralInspector from "../components/GeneralInspector";
import {
  setBetaFeaturesEnabled,
  setPersistClusters
} from "../actions/applicationLayout";
import { getPresentGraph } from "../selectors"

const mapStateToProps = state => {
  return {
    graph: getPresentGraph(state),
    selection: state.selection,
    betaFeaturesEnabled: state.applicationLayout.betaFeaturesEnabled,
    layers: state.applicationLayout.layers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSaveGraphStyle: (key, value) => dispatch(setGraphStyle(key, value)),
    onSetBetaFeaturesEnabled: enabled => dispatch(setBetaFeaturesEnabled(enabled)),
    onSetPersistClusters: enabled => dispatch(setPersistClusters(enabled))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GeneralInspector)