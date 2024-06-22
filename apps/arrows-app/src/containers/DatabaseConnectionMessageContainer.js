import { connect } from 'react-redux';
import DatabaseConnectionMessage from '../components/DatabaseConnectionMessage';

const mapStateToProps = (state) => {
  return {
    connectionParameters: state.storage.database.connectionParameters,
    errorMsg: state.storage.database.errorMsg,
  };
};

export default connect(mapStateToProps, null)(DatabaseConnectionMessage);
