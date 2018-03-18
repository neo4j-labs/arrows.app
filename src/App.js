import React, {Component} from 'react'
import HeaderContainer from "./containers/HeaderContainer"
import GraphContainer from "./containers/GraphContainer"
import Sidebar from "./components/Sidebar"
import {connect} from 'react-redux'
import './App.css'
import withKeybindings, { ignoreTarget } from './interactions/Keybindings'
import { compose } from 'recompose'

class App extends Component {
  constructor (props) {
    super(props)
    window.onkeydown = this.fireKeyboardShortcutAction.bind(this)
  }
  state = { sidebarVisible : false }
  render() {
    return (
        <Sidebar visible={this.props.sidebar.status === 'expanded'}>
          <div className="App">
            <HeaderContainer/>
            <GraphContainer/>
          </div>
        </Sidebar>
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
  sidebar: state.sidebar
})

export default compose(
  connect(mapStateToProps, null),
  withKeybindings
)(App)
