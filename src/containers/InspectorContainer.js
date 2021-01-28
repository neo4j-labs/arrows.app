import {connect} from "react-redux";
import {
  setProperty,
  setNodeCaption,
  setRelationshipType,
  renameProperty,
  removeProperty,
  setArrowsProperty,
  removeArrowsProperty,
  reverseRelationships,
  addLabel,
  renameLabel,
  removeLabel,
  duplicateSelection,
  convertCaptionsToLabels
} from "../actions/graph";
import DetailInspector from "../components/DetailInspector"
import { getSelectedNodes } from "../selectors/inspection";
import { getPresentGraph } from "../selectors"
import {toggleSelection} from "../actions/selection";

const mapStateToProps = state => {
  const graph = getPresentGraph(state)
  return {
    graph,
    selection: state.selection,
    selectedNodes: getSelectedNodes({ ...state, graph }),
    inspectorVisible: state.applicationLayout.inspectorVisible
  }
}

const mapDispatchToProps = dispatch => {
  return {
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
    onConvertCaptionsToLabels: (selection, caption) => {
      dispatch(convertCaptionsToLabels(selection, caption))
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
    onDuplicate: () => {
      dispatch(duplicateSelection())
    },
    reverseRelationships: selection => {
      dispatch(reverseRelationships(selection))
    },
    onSelect: (entities) => {
      dispatch(toggleSelection(entities, 'replace'))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailInspector)