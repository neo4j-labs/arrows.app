import React, {Component} from 'react'
import GraphContainer from "./containers/GraphContainer"
import {connect} from 'react-redux'
import './App.css'
import withKeybindings, { ignoreTarget } from './interactions/Keybindings'
import {windowResized} from "./actions/applicationLayout"
import { compose } from 'recompose'
import { Sidebar } from 'semantic-ui-react'
import HeaderContainer from './containers/HeaderContainer'
import InspectorContainer from "./containers/InspectorContainer"
import EditConnectionParametersContainer from "./containers/EditConnectionParametersContainer"
import DatabaseConnectionMessageContainer from "./containers/DatabaseConnectionMessageContainer"
import {GoogleDriveIntegration} from "./components/GoogleDriveIntegration"
import {inspectorWidth} from "./model/applicationLayout";

class App extends Component {
  constructor (props) {
    super(props)
    window.onkeydown = this.fireKeyboardShortcutAction.bind(this)
  }
  render() {
    const connectionParametersModal = this.props.editingConnectionParameters ? (<EditConnectionParametersContainer/>) : null
    const databaseConnectionMessageModal = this.props.showDisconnectedDialog ? (<DatabaseConnectionMessageContainer/>) : null
    return (
      <Sidebar.Pushable>

        <Sidebar
          animation='overlay'
          direction='right'
          visible={this.props.inspectorVisible}
          style={{'backgroundColor': 'white', width: inspectorWidth + 'px'}}
        >
          <InspectorContainer/>
        </Sidebar>

        <Sidebar.Pusher
          style={{height: '100%'}}
        >
          {connectionParametersModal}
          {databaseConnectionMessageModal}
          <HeaderContainer/>
          <GraphContainer/>
          <GoogleDriveIntegration/>
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
  editingConnectionParameters: state.databaseConnection.editingConnectionParameters,
  showDisconnectedDialog: state.databaseConnection.showDisconnectedDialog
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
