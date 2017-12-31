import React, {Component} from 'react';
import headerStyle from '../App'

export const headerHeight = 50;

export default class Header extends Component {
  render() {
    const headerStyle = {
      height: headerHeight
    };
    return (
      <header style={headerStyle} className="App-header"/>
    )
  }
}
