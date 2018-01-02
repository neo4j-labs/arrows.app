import React, {Component} from 'react';
import {drawNode} from "../graphics/canvasRenderer";
import TouchHandler from "../interactions/TouchHandler";
import {PanZoomState} from "../interactions/PanZoomState";

class GraphDisplay extends Component {
  constructor() {
    super();
    this.panZoomState = new PanZoomState()
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResized.bind(this))
    new TouchHandler(this.refs.canvas, this.panZoomState)
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
      drawNode(ctx, this.panZoomState.transform(node.position), '#53acf3', 50)
    })
  }
}

export default GraphDisplay
