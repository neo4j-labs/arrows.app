import {connect} from "react-redux";
import {
  setProperty, setNodeCaption, setRelationshipType, renameProperty, addLabel, renameLabel, removeLabel
} from "../actions/graph";
import {getVisualGraph} from "../selectors"
import {GraphTextEditors} from "../components/GraphTextEditors";
import React from "react";

const mapStateToProps = state => {
  return {
    visualGraph: getVisualGraph(state),
    selection: state.selection,
    viewTransformation: state.viewTransformation
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
    onSetNodeCaption: (selection, caption) => {
      dispatch(setNodeCaption(selection, caption))
    },
    onSetRelationshipType: (selection, type) => {
      dispatch(setRelationshipType(selection, type))
    },
    onSetPropertyKey: (selection, oldPropertyKey, newPropertyKey) => {
      dispatch(renameProperty(selection, oldPropertyKey, newPropertyKey))
    },
    onSetPropertyValue: (selection, key, value) => {
      dispatch(setProperty(selection, key, value))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphTextEditors)