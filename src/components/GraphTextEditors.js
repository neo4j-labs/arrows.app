import React, {Component} from 'react';
import {CaptionEditor} from "./CaptionEditor";

export class GraphTextEditors extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const captionEditors = Object.values(this.props.visualGraph.nodes)
      .filter(visualNode => visualNode.caption)
      .map(visualNode => {
        return (
          <CaptionEditor
            visualNode={visualNode}
            onSetNodeCaption={this.props.onSetNodeCaption}
          />
        )
      })

    return (
      <div style={{
        transform: this.props.viewTransformation.asCSSTransform(),
        position: 'absolute',
        left: 0,
        top: 0
      }}>
        {captionEditors}
      </div>
    )
  }
}