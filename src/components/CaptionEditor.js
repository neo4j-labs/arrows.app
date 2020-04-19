import React, {Component} from 'react';

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
    return (
      <textarea ref={this.textArea} style={{
        position: 'absolute',
        left: boundingBox.left - (caption.orientation.horizontal === 'center' ? padding : 0),
        top: boundingBox.top,
        width: boundingBox.width + padding * 2,
        height: boundingBox.height + padding,
        resize: 'none',
        outline: 'none',
        border: 'none',
        background: 'transparent',
        textAlign: 'center',
        ...caption.font,
        lineHeight: 1.2
      }} value={textLines.join('\n')} //onChange={this.handleChange}
      >
      </textarea>
    )
  }
}