import React, {Component} from 'react';
import { headerHeight } from './Header'

class GraphDisplay extends Component {
  constructor() {
    super();
    this.state = {width: 1, height: 1}
  }

  componentDidMount() {
    this.fillPage();
    window.addEventListener('resize', this.fillPage.bind(this))
  }

  fillPage() {
    let innerWidth = window.innerWidth;
    let innerHeight = window.innerHeight;
    this.setState({width: innerWidth, height: innerHeight - headerHeight})
  }

  render() {
    return (
      <canvas width={this.state.width} height={this.state.height}/>
    )
  }
}

export default GraphDisplay
