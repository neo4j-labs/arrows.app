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
  convertCaptionsToLabels,
  convertCaptionsToPropertyValues,
  inlineRelationships,
  mergeOnPropertyValues,
  mergeNodes,
  deleteSelection
} from "../actions/graph";
import DetailInspector from "../components/DetailInspector"
import { getSelectedNodes } from "../selectors/inspection";
import { getPresentGraph } from "../selectors"
import {toggleSelection} from "../actions/selection";

const mapStateToProps = state => {
  const graph = getPresentGraph(state)
  return {
    graph,
    cachedImages: state.cachedImages,
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
    onConvertCaptionsToLabels: () => {
      dispatch(convertCaptionsToLabels())
    },
    onConvertCaptionsToPropertyValues: () => {
      dispatch(convertCaptionsToPropertyValues())
    },
    onSaveType: (selection, type) => {
      dispatch(setRelationshipType(selection, type))
    },
    onMergeOnValues: (selection, propertyKey) => {
      dispatch(mergeOnPropertyValues(selection, propertyKey))
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
    onDelete: () => {
      dispatch(deleteSelection())
    },
    reverseRelationships: selection => {
      dispatch(reverseRelationships(selection))
    },
    mergeNodes: selection => {
      dispatch(mergeNodes(selection))
    },
    inlineRelationships: selection => {
      dispatch(inlineRelationships(selection))
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