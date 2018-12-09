import React, {Component} from 'react'
import GraphContainer from "./containers/GraphContainer"
import {connect} from 'react-redux'
import './App.css'
import withKeybindings, { ignoreTarget } from './interactions/Keybindings'
import {windowResized} from "./actions/applicationLayout"
import { compose } from 'recompose'
import { Sidebar } from 'semantic-ui-react'
import HeaderContainer from './containers/HeaderContainer'
import InspectorChooser from "./containers/InspectorChooser"
import StorageConfigContainer from "./containers/StorageConfigContainer"
import DatabaseConnectionMessageContainer from "./containers/DatabaseConnectionMessageContainer"
import {inspectorWidth} from "./model/applicationLayout";
import ExportContainer from "./containers/ExportContainer";
import GoogleSignInModal from "./components/editors/GoogleSignInModal";
import DatabaseConnectionContainer from "./containers/DatabaseConnectionContainer";

class App extends Component {
  constructor (props) {
    super(props)
    window.onkeydown = this.fireKeyboardShortcutAction.bind(this)
  }
  render() {
    const storageConfigModal = this.props.viewingConfig ? (<StorageConfigContainer/>) : null
    const databaseConnectionModal = this.props.editingConnectionParameters ? (<DatabaseConnectionContainer/>) : null
    const databaseConnectionMessageModal = this.props.showDisconnectedDialog ? (<DatabaseConnectionMessageContainer/>) : null
    const exportModal = this.props.showExportDialog ? (<ExportContainer/>) : null
    return (
      <Sidebar.Pushable>

        <Sidebar
          animation='overlay'
          direction='right'
          visible={this.props.inspectorVisible}
          style={{'backgroundColor': 'white', width: inspectorWidth + 'px'}}
        >
          <InspectorChooser/>
        </Sidebar>

        <Sidebar.Pusher
          style={{height: '100%'}}
        >
          {storageConfigModal}
          {databaseConnectionModal}
          {databaseConnectionMessageModal}
          {exportModal}
          <GoogleSignInModal/>
          <HeaderContainer/>
          <GraphContainer/>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }

  fireKeyboardShortcutAction(ev) {
    if (ignoreTarget(ev)) return

    const handled = this.props.fireAction(ev)
    if (handled) {
      ev.preventDefault()
      ev.stopPropagation()
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResized)
  }
}

const mapStateToProps = (state) => ({
  inspectorVisible: state.applicationLayout.inspectorVisible,
  viewingConfig: state.storage.mode === 'NONE',
  editingConnectionParameters: state.storage.database.editingConnectionParameters,
  showDisconnectedDialog: state.storage.database.showDisconnectedDialog,
  showExportDialog: state.exporting.showExportDialog
})


const mapDispatchToProps = dispatch => {
  return {
    onWindowResized: () => dispatch(windowResized(window.innerWidth, window.innerHeight)),
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withKeybindings
)(App)
