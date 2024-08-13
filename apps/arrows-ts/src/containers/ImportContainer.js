import { connect } from 'react-redux';
import ImportModal from '../components/ImportModal';
import { hideImportDialog } from '../actions/applicationDialogs';
import { nodeSeparation, tryImport } from '../actions/import';
import { getOntologies } from '../selectors';

const mapStateToProps = (state) => {
  return {
    separation: nodeSeparation(state),
    ontologies: getOntologies(state).ontologies,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    tryImport: tryImport(dispatch),
    onCancel: () => {
      dispatch(hideImportDialog());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImportModal);
