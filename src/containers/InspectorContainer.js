import {connect} from "react-redux";
import {
  setProperty, setNodeCaption, setRelationshipType, renameProperty, removeProperty,
  setArrowsProperty, removeArrowsProperty, reverseRelationships
} from "../actions/graph";
import DetailInspector from "../components/DetailInspector"
import {showInspector, hideInspector} from "../actions/applicationLayout";
import { getSelectedNodes } from "../selectors/inspection";

const mapStateToProps = state => {
  return {
    graph: state.graph,
    selection: state.selection,
    selectedNodes: getSelectedNodes(state),
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