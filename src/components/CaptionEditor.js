import React, {Component} from 'react';
import {cssAlignFromSvgAlign} from "../graphics/circumferentialTextAlignment";

export class CaptionEditor extends Component {

  constructor(props) {
    super(props)
    this.textArea = React.createRef()
  }

  render() {
    const caption = this.props.visualNode.caption
    const boundingBox = caption.boundingBox()
    const textLines = caption.layout.lines
    const padding = 10
    const horizontal = caption.orientation.horizontal
    return (
      <textarea ref={this.textArea} style={{
        position: 'absolute',
        padding: 0,
        left: boundingBox.left - (horizontal === 'start' ? 0 : padding),
        top: boundingBox.top,
        width: boundingBox.width + padding + (horizontal === 'center' ? padding : 0),
        height: boundingBox.height + padding,
        resize: 'none',
        outline: 'none',
        border: 'none',
        background: 'transparent',
        textAlign: cssAlignFromSvgAlign(horizontal),
        ...caption.font,
        lineHeight: 1.2
      }} value={textLines.join('\n')} //onChange={this.handleChange}
      >
      </textarea>
    )
  }
}