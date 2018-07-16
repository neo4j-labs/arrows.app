import React, {Component} from 'react'
import GraphContainer from "./containers/GraphContainer"
import {connect} from 'react-redux'
import './App.css'
import withKeybindings, { ignoreTarget } from './interactions/Keybindings'
import { compose } from 'recompose'
import { Grid, Tab, Header, Icon, Menu} from 'semantic-ui-react'
import DetailInspector from "./components/DetailInspector"
import GeneralInspector from './components/GeneralInspector'
import HeaderContainer from './containers/HeaderContainer'
import EditConnectionParametersContainer from "./containers/EditConnectionParametersContainer";
import DatabaseConnectionMessageContainer from "./containers/DatabaseConnectionMessageContainer";

const panes = [{
  menuItem:
    <Menu.Item key='detail' style={{width: '50%'}}>
      <Header as='h3'>
        <Icon name='edit'/>
        Inspector
      </Header>
    </Menu.Item>,
  render: () => <Tab.Pane><DetailInspector/></Tab.Pane>
}, {
  menuItem: <Menu.Item key='general' style={{ width: '50%' }}>
    <Header as='h3'>
      <Icon name='settings'/>
      Settings
    </Header>
  </Menu.Item>,
  render: () => <Tab.Pane><GeneralInspector/></Tab.Pane>
}]

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
      <Grid columns={2}>
        <Grid.Row style={{paddingBottom: 0}}>
          <Grid.Column width={16}>
            {connectionParametersModal}
            {databaseConnectionMessageModal}
            <HeaderContainer/>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row style={{paddingTop: 0}}>
          <Grid.Column width={12}>
            <GraphContainer/>
          </Grid.Column>
          <Grid.Column width={4}>
            <Tab menu={{ secondary: true, pointing: true }} grid={{tabWidth: 6}} panes={panes}/>
          </Grid.Column>
        </Grid.Row>
      </Grid>
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
