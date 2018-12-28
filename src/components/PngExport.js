import React, {Component} from 'react';
import { Image, Segment, Label } from 'semantic-ui-react'
import {renderGraphAtScaleFactor} from "../graphics/utils/offScreenCanvasRenderer";

class PngExport extends Component {

  render() {
    const dataUrl = renderGraphAtScaleFactor(this.props.graph, this.props.pixelRatio)

    return (
      <Segment style={{
        maxHeight: 200,
        overflow: 'hidden',
      }}>
        <Label attached='top'>@{this.props.pixelRatio}x <a href={dataUrl} download="graph.png">Download</a></Label>
        <Image src={dataUrl}/>
      </Segment>
    )
  }
}

export default PngExport