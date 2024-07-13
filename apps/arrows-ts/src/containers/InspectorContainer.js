import { connect } from 'react-redux';
import {
  setProperty,
  setNodeCaption,
  setRelationshipType,
  renameProperty,
  removeProperty,
  setArrowsProperty,
  removeArrowsProperty,
  reverseRelationships,
  duplicateSelection,
  convertCaptionsToPropertyValues,
  inlineRelationships,
  mergeOnPropertyValues,
  mergeNodes,
  deleteSelection,
  setOntology,
  setExamples,
  setCardinality,
} from '../actions/graph';
import DetailInspector from '../components/DetailInspector';
import { getSelectedNodes } from '../selectors/inspection';
import { getPresentGraph } from '../selectors';
import { toggleSelection } from '../actions/selection';

const mapStateToProps = (state) => {
  const graph = getPresentGraph(state);
  return {
    graph,
    cachedImages: state.cachedImages,
    selection: state.selection,
    selectedNodes: getSelectedNodes({ ...state, graph }),
    inspectorVisible: state.applicationLayout.inspectorVisible,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSaveCaption: (selection, caption) => {
      dispatch(setNodeCaption(selection, caption));
    },
    onConvertCaptionsToPropertyValues: () => {
      dispatch(convertCaptionsToPropertyValues());
    },
    onSaveExamples: (selection, examples) => {
      dispatch(setExamples(selection, examples));
    },
    onSaveType: (selection, type) => {
      dispatch(setRelationshipType(selection, type));
    },
    onMergeOnValues: (selection, propertyKey) => {
      dispatch(mergeOnPropertyValues(selection, propertyKey));
    },
    onSavePropertyKey: (selection, oldPropertyKey, newPropertyKey) => {
      dispatch(renameProperty(selection, oldPropertyKey, newPropertyKey));
    },
    onSavePropertyValue: (selection, key, value) => {
      dispatch(setProperty(selection, key, value));
    },
    onSaveArrowsPropertyValue: (selection, key, value) => {
      dispatch(setArrowsProperty(selection, key, value));
    },
    onDeleteProperty: (selection, key) => {
      dispatch(removeProperty(selection, key));
    },
    onDeleteArrowsProperty: (selection, key) => {
      dispatch(removeArrowsProperty(selection, key));
    },
    onDuplicate: () => {
      dispatch(duplicateSelection());
    },
    onDelete: () => {
      dispatch(deleteSelection());
    },
    reverseRelationships: (selection) => {
      dispatch(reverseRelationships(selection));
    },
    mergeNodes: (selection) => {
      dispatch(mergeNodes(selection));
    },
    inlineRelationships: (selection) => {
      dispatch(inlineRelationships(selection));
    },
    onSelect: (entities) => {
      dispatch(toggleSelection(entities, 'replace'));
    },
    onSaveOntology: (selection, ontologies) => {
      dispatch(setOntology(selection, ontologies));
    },
    onSaveCardinality: (selection, cardinality) => {
      dispatch(setCardinality(selection, cardinality));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailInspector);
