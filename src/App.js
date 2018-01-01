import React, {Component} from 'react';
import HeaderContainer from "./containers/HeaderContainer";
import GraphContainer from "./containers/GraphContainer";
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <HeaderContainer/>
        <GraphContainer/>
      </div>
    );
  }
}
