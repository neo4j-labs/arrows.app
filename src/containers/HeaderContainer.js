import {connect} from 'react-redux'
import {createNode} from '../actions/graph'
import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import Header from '../components/Header'
import {viewStorageConfig} from "../actions/databaseConnection";
import {showInspector} from "../actions/applicationLayout";
import {setDiagramName} from "../actions/diagramName";
import {showExportDialog} from "../actions/exporting";
import {newDiagram} from "../actions/diagram";

const mapStateToProps = state => {
  return {
    diagramName: state.diagramName,
    storageStatus: state.storageStatus,
    storage: state.storage
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onNewDiagramClick: () => {
      dispatch(newDiagram())
    },
    setDiagramName: (diagramName) => {
      dispatch(setDiagramName(diagramName))
    },
    showInspector: () => {
      dispatch(showInspector())
    },
    onPlusNodeClick: () => {
      dispatch(createNode())
    },
    onReloadGraphClick: () => {
      dispatch(fetchGraphFromDatabase())
    },
    onViewStorageConfig: () => {
      dispatch(viewStorageConfig())
    },
    onExportClick: () => {
      dispatch(showExportDialog())
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer