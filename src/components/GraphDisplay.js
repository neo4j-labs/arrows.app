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
    this.drawGraph();
  }

  componentDidUpdate() {
    this.drawGraph();
  }

  drawGraph() {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0,0, this.state.width, this.state.height);
    this.props.graph.nodes.forEach((node) => {
      GraphDisplay.rect({ctx, x: node.position.x, y: node.position.y, width: 50, height: 50});
    })
  }

  static rect(props) {
    const {ctx, x, y, width, height} = props;
    ctx.fillRect(x, y, width, height);
  }

  fillPage() {
    let innerWidth = window.innerWidth;
    let innerHeight = window.innerHeight;
    this.setState({width: innerWidth, height: innerHeight - headerHeight})
  }

  render() {
    return (
      <canvas width={this.state.width} height={this.state.height} ref="canvas"/>
    )
  }
}

export default GraphDisplay
