import {connect} from "react-redux";
import {
  setProperty, setNodeCaption, setRelationshipType, renameProperty, removeProperty,
  setArrowsProperty, removeArrowsProperty, reverseRelationships, addLabel, renameLabel, removeLabel
} from "../actions/graph";
import DetailInspector from "../components/DetailInspector"
import {showInspector, hideInspector} from "../actions/applicationLayout";
import { getSelectedNodes } from "../selectors/inspection";
import { getPresentGraph, hideGraphHistory } from "../selectors"

const mapStateToProps = state => {
  return {
    graph: getPresentGraph(state),
    selection: state.selection,
    selectedNodes: getSelectedNodes(hideGraphHistory(state)),
    inspectorVisible: state.applicationLayout.inspectorVisible
  }
}

const mapDispatchToProps = dispatch => {
  return {
    hideInspector: () => {
      dispatch(hideInspector())
    },
    showInspector: () => {
      dispatch(showInspector())
    },
    onAddLabel: (selection, label) => {
      dispatch(addLabel(selection, label))
    },
    onRenameLabel: (selection, oldLabel, newLabel) => {
      dispatch(renameLabel(selection, oldLabel, newLabel))
    },
    onRemoveLabel: (selection, label) => {
      dispatch(removeLabel(selection, label))
    },
    onSaveCaption: (selection, caption) => {
      dispatch(setNodeCaption(selection, caption))
    },
    onSaveType: (selection, type) => {
      dispatch(setRelationshipType(selection, type))
    },
    onSavePropertyKey: (selection, oldPropertyKey, newPropertyKey) => {
      dispatch(renameProperty(selection, oldPropertyKey, newPropertyKey))
    },
    onSavePropertyValue: (selection, key, value) => {
      dispatch(setProperty(selection, key, value))
    },
    onSaveArrowsPropertyValue: (selection, key, value) => {
      dispatch(setArrowsProperty(selection, key, value))
    },
    onDeleteProperty: (selection, key) => {
      dispatch(removeProperty(selection, key))
    },
    onDeleteArrowsProperty: (selection, key) => {
      dispatch(removeArrowsProperty(selection, key))
    },
    reverseRelationships: selection => {
      dispatch(reverseRelationships(selection))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailInspector)