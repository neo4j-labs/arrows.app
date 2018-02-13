import React, {Component} from 'react'
import HeaderContainer from "./containers/HeaderContainer"
import GraphContainer from "./containers/GraphContainer"
import Sidebar from "./components/Sidebar"

import './App.css'

export default class App extends Component {
  state = { sidebarVisible : false }
  render() {
    const { sidebarVisible } = this.state
    return (
        <Sidebar visible={sidebarVisible}>
          <div className="App">
            <HeaderContainer sidebarVisible={sidebarVisible} toggleSidebar={() => this.setState({sidebarVisible: !this.state.sidebarVisible})}/>
            <GraphContainer/>
          </div>
        </Sidebar>
    );
  }
}
