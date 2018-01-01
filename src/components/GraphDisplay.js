import React, {Component} from 'react';
import {drawNode} from "../graphics/canvasRenderer";

class GraphDisplay extends Component {
  constructor() {
    super();
    this.state = {width: 1, height: 1}
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResized.bind(this))
    this.drawGraph();
  }

  componentDidUpdate() {
    this.drawGraph();
  }

  render() {
    return (
      <canvas width={this.props.canvasSize.width} height={this.props.canvasSize.height} ref="canvas"/>
    )
  }

  drawGraph() {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0,0, this.props.canvasSize.width, this.props.canvasSize.height);
    this.props.graph.nodes.forEach((node) => {
      drawNode(ctx, node.position.x, node.position.y, '#53acf3', 50)
    })
  }
}

export default GraphDisplay
