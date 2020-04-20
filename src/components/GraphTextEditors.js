import React, {Component} from 'react';
import {CaptionEditor} from "./CaptionEditor";

export class GraphTextEditors extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    let captionEditor = null

    if (this.props.selection.editing) {
      const visualNode = this.props.visualGraph.nodes[this.props.selection.editing.id]
      if (visualNode.caption) {
        captionEditor = (
          <CaptionEditor
            visualNode={visualNode}
            onSetNodeCaption={this.props.onSetNodeCaption}
          />
        )
      }
    }

    return (
      <div style={{
        transform: this.props.viewTransformation.asCSSTransform(),
        position: 'absolute',
        left: 0,
        top: 0
      }}>
        {captionEditor}
      </div>
    )
  }
}