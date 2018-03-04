import React, {Component} from 'react'
import HeaderContainer from "./containers/HeaderContainer"
import GraphContainer from "./containers/GraphContainer"
import Sidebar from "./components/Sidebar"
import {connect} from 'react-redux'
import './App.css'

class App extends Component {
  state = { sidebarVisible : false }
  render() {
    const { sidebar, graph } = this.props
    return (
        <Sidebar visible={sidebar.status === 'expanded'} sidebarData={sidebar} graph={graph}>
          <div className="App">
            <HeaderContainer sidebarVisible={sidebar.status === 'expanded'} toggleSidebar={() => this.setState({sidebarVisible: !this.state.sidebarVisible})}/>
            <GraphContainer/>
          </div>
        </Sidebar>
    );
  }
}

const mapStateToProps = (state) => ({
  sidebar: state.sidebar,
  graph: state.graph
})

export default connect(mapStateToProps, null)(App)

