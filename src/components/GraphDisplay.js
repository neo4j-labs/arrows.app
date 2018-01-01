import React, {Component} from 'react';

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
      GraphDisplay.rect({ctx, x: node.position.x, y: node.position.y, width: 50, height: 50});
    })
  }

  static rect(props) {
    const {ctx, x, y, width, height} = props;
    ctx.fillRect(x, y, width, height);
  }
}

export default GraphDisplay
