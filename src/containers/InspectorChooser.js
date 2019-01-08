import React, {Component} from 'react'
import {connect} from "react-redux";
import {selectedNodes, selectedRelationships} from "../model/selection";
import InspectorContainer from "./InspectorContainer";
import GeneralInspectorContainer from "./GeneralInspectorContainer";
import { getSelectedNodes } from "../selectors/inspection";

const mapStateToProps = state => {
  const selection = state.selection
  const graph = state.graph
  return {
    showSelectionInspector: getSelectedNodes(state).length > 0 || selectedRelationships(graph, selection).length > 0
  }
}

class Chooser extends Component {
  render() { return this.props.showSelectionInspector ? (
    <InspectorContainer/>
  ) : (
    <GeneralInspectorContainer/>
  )}
}

export default connect(
  mapStateToProps,
  null
)(Chooser)