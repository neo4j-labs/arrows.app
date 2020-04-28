import React, {Component} from 'react';

export class PropertyKeyEditor extends Component {

  handleChange = (e) => {
    this.props.onSetPropertyKey(e.target.value)
  }

  render() {
    const padding = 10
    return (
      <input
        value={this.props.text}
        onChange={this.handleChange}
        style={{
          position: 'absolute',
          padding: 0,
          left: this.props.left - padding,
          top: this.props.top,
          width: this.props.width + padding,
          height: this.props.font.fontSize * 1.2,
          outline: 'none',
          border: 'none',
          background: 'transparent',
          textAlign: 'right',
          ...this.props.font,
          lineHeight: 1.2
        }}
      >
      </input>
    )
  }
}