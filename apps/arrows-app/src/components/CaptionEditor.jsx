import React, { Component } from 'react';
import { cssAlignFromSvgAlign } from '../graphics/circumferentialTextAlignment';

export class CaptionEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.textArea = React.createRef();
  }

  componentDidMount() {
    const textArea = this.textArea.current;
    textArea.select();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps.visualNode !== this.props.visualNode;
  }

  componentDidUpdate() {
    const textArea = this.textArea.current;
    if (document.activeElement === textArea) {
      textArea.selectionStart = this.state.selectionStart;
      textArea.selectionEnd = this.state.selectionStart;
    }
  }

  handleChange = (e) => {
    const normalise = (text) => text.replace(/\s+/g, ' ');
    const selectionStart = normalise(
      e.target.value.substring(0, e.target.selectionStart)
    ).length;
    const caption = normalise(e.target.value);
    this.setState({ selectionStart });
    this.props.onSetNodeCaption(caption);
  };

  render() {
    const caption = this.props.component;
    const boundingBox = caption.boundingBox();
    const textLines = caption.layout.lines;
    const padding = 10;
    const horizontal = caption.orientation.horizontal;
    return (
      <textarea
        ref={this.textArea}
        value={textLines.join('\n')}
        onKeyDown={this.props.onKeyDown}
        onChange={this.handleChange}
        style={{
          position: 'absolute',
          padding: 0,
          left: boundingBox.left - (horizontal === 'start' ? 0 : padding),
          top: boundingBox.top,
          width:
            boundingBox.width +
            padding +
            (horizontal === 'center' ? padding : 0),
          height: boundingBox.height + padding,
          resize: 'none',
          outline: 'none',
          border: 'none',
          background: 'transparent',
          textAlign: cssAlignFromSvgAlign(horizontal),
          ...caption.font,
          lineHeight: 1.2,
        }}
      ></textarea>
    );
  }
}
