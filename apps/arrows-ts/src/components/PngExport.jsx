import React, {Component} from 'react';
import {Image, Segment, Label, Icon} from 'semantic-ui-react'
import {renderPngAtScaleFactor} from "../graphics/utils/offScreenCanvasRenderer";

class PngExport extends Component {

  render() {
    try {
      const {width, height, dataUrl} = renderPngAtScaleFactor(
        this.props.graph,
        this.props.cachedImages,
        this.props.pixelRatio,
        this.props.pixelRatio === 1 ? Infinity : 4000 * 4000,
        this.props.transparentBackground
      )

      return (
        <Segment style={{
          maxHeight: 200,
          overflow: 'hidden',
        }}>
          <Label attached='top'>
            @{this.props.pixelRatio}x {width} × {height}
            <a href={dataUrl} download={this.props.diagramName + ".png"}><Icon name="download"/>Download</a>
          </Label>
          <div style={{
            display: 'inline-block',
            backgroundImage: 'linear-gradient(45deg, #efefef 25%, transparent 25%), ' +
              'linear-gradient(-45deg, #efefef 25%, transparent 25%), ' +
              'linear-gradient(45deg, transparent 75%, #efefef 75%), ' +
              'linear-gradient(-45deg, transparent 75%, #efefef 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}>
            <Image src={dataUrl}/>
          </div>
        </Segment>
      )
    } catch (e) {
      console.log(e)
      return null
    }
  }
}

export default PngExport