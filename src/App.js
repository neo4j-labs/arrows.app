import React, {Component} from 'react'
import GraphContainer from "./containers/GraphContainer"
import {connect} from 'react-redux'
import './App.css'
import withKeybindings, { ignoreTarget } from './interactions/Keybindings'
import { compose } from 'recompose'
import { Tab, Header, Icon, Menu, Sidebar, Segment, Table, Input, Form, Button} from 'semantic-ui-react'
import DetailInspector from "./components/DetailInspector"
import GeneralInspector from './components/GeneralInspector'
import HeaderContainer from './containers/HeaderContainer'
import EditConnectionParametersContainer from "./containers/EditConnectionParametersContainer";
import DatabaseConnectionMessageContainer from "./containers/DatabaseConnectionMessageContainer";
import {PropertyRow} from "./components/PropertyRow";

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
      <div>
        <Sidebar.Pushable>

          <Sidebar
            animation='overlay'
            direction='right'
            visible={true}
            // width="very wide"
            style={{'backgroundColor': 'white', width: '425px'}}
          >
            <Segment basic>
              <Form>
                <Form.Field key='_caption'>
                  <label>Caption</label>
                  <Input width="{3}"/>
                </Form.Field>
                <Form.Field>
                  <label>Properties</label>
                  <Table compact collapsing style={{marginTop: 0}}>
                    <Table.Body>
                      <PropertyRow/>
                      <PropertyRow/>
                      <PropertyRow/>
                    </Table.Body>
                  </Table>
                  <Button content="Property" basic size="tiny" icon="plus"/>
                </Form.Field>
                <Form.Field>
                  <label>Style</label>
                  <Table compact collapsing style={{marginTop: 0}}>
                    <Table.Body>
                      <PropertyRow/>
                      <PropertyRow/>
                      <PropertyRow/>
                    </Table.Body>
                  </Table>
                  <Button content="Style" basic size="tiny" icon="plus"/>
                </Form.Field>
              </Form>
            </Segment>
          </Sidebar>

          <Sidebar.Pusher>
              {connectionParametersModal}
              {databaseConnectionMessageModal}
              <HeaderContainer/>
              <GraphContainer/>
              <DetailInspector/>
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
