import { connect } from 'react-redux';
import { getFileFromLocalStorage, pickDiagramCancel } from '../actions/storage';
import LocalStoragePickerModal from '../components/LocalStoragePickerModal';

const mapStateToProps = (state) => {
  return {
    recentStorage: state.recentStorage.filter(
      (entry) => entry.mode === 'LOCAL_STORAGE'
    ),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onPick: (fileId) => {
      dispatch(getFileFromLocalStorage(fileId));
    },
    onCancel: () => {
      dispatch(pickDiagramCancel());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LocalStoragePickerModal);
