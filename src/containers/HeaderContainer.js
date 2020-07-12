import {connect} from 'react-redux'
import Header from '../components/Header'
import {toggleInspector} from "../actions/applicationLayout";
import {setDiagramName} from "../actions/diagramName";
import {showExportDialog} from "../actions/applicationDialogs";
import { newDiagram } from "../actions/diagram";

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
    onExportClick: () => {
      dispatch(showExportDialog())
    },
  }
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)

export default HeaderContainer
