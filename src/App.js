import React, {Component} from 'react'
import GraphContainer from "./containers/GraphContainer"
import {connect} from 'react-redux'
import './App.css'
import withKeybindings, { ignoreTarget } from './interactions/Keybindings'
import { compose } from 'recompose'
import { Sidebar } from 'semantic-ui-react'
import HeaderContainer from './containers/HeaderContainer'
import InspectorContainer from "./containers/InspectorContainer"
import EditConnectionParametersContainer from "./containers/EditConnectionParametersContainer"
import DatabaseConnectionMessageContainer from "./containers/DatabaseConnectionMessageContainer"

class App extends Component {
  constructor (props) {
    super(props)
    window.onkeydown = this.fireKeyboardShortcutAction.bind(this)
  }
  state = { sidebarVisible : false }
  render() {
    const connectionParametersModal = this.props.editingConnectionParameters ? (<EditConnectionParametersContainer/>) : null
    const databaseConnectionMessageModal = this.props.showDisconnectedDialog ? (<DatabaseConnectionMessageContainer/>) : null
    return (
      <div>
        <Sidebar.Pushable>

          <Sidebar
            animation='overlay'
            direction='right'
            visible={true}
            style={{'backgroundColor': 'white', width: '425px'}}
          >
            <InspectorContainer/>
          </Sidebar>

          <Sidebar.Pusher>
            {connectionParametersModal}
            {databaseConnectionMessageModal}
            <HeaderContainer/>
            <GraphContainer/>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
  fireKeyboardShortcutAction (ev) {
    if (ignoreTarget(ev)) return

    const handled = this.props.fireAction(ev)
    if (handled) {
      ev.preventDefault()
      ev.stopPropagation()
    }
  }
}

const mapStateToProps = (state) => ({
  sidebar: state.sidebar,
  editingConnectionParameters: state.databaseConnection.editingConnectionParameters,
  showDisconnectedDialog: state.databaseConnection.showDisconnectedDialog
})

export default compose(
  connect(mapStateToProps, null),
  withKeybindings
)(App)
