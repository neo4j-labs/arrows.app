import React, {Component} from 'react';
import Header from "./components/Header";
import GraphDisplay from "./components/GraphDisplay";
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <GraphDisplay />
      </div>
    );
  }
}
