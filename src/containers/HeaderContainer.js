import {connect} from 'react-redux'
import {createNode} from '../actions/graph'
import Header from '../components/Header'
import {editConnectionParameters} from "../actions/databaseConnection";
import {toggleInspector} from "../actions/applicationLayout";
import {setDiagramName} from "../actions/diagramName";
import {showExportDialog, showHelpDialog} from "../actions/applicationDialogs";
import { newDiagram } from "../actions/diagram";
import {reloadGraph} from "../actions/storage";

const mapStateToProps = state => {
  return {
    diagramName: state.diagramName,
    storageStatus: state.storageStatus,
    storage: state.storage
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onArrowsClick: () => {
      dispatch(newDiagram())
    },
    setDiagramName: (diagramName) => {
      dispatch(setDiagramName(diagramName))
    },
    showInspector: () => {
      dispatch(toggleInspector())
    },
    onPlusNodeClick: () => {
      dispatch(createNode())
    },
    onReloadGraphClick: () => {
      dispatch(reloadGraph())
    },
    onEditConnectionParameters: () => {
      dispatch(editConnectionParameters())
    },
    onExportClick: () => {
      dispatch(showExportDialog())
    },
    onHelpClick: () => {
      dispatch(showHelpDialog())
    }
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer
