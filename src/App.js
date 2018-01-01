import React, {Component} from 'react';
import HeaderContainer from "./containers/HeaderContainer";
import Header from "./components/Header";
import GraphDisplay from "./components/GraphDisplay";
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <HeaderContainer>
          <Header />
        </HeaderContainer>
        <GraphDisplay />
      </div>
    );
  }
}
