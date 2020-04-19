import React, {Component} from 'react';

export class CaptionEditor extends Component {

  constructor(props) {
    super(props)
    this.textArea = React.createRef()
  }

  render() {
    return (
      <textarea ref={this.textArea} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 200,
        height: 100,
        resize: 'none',
        outline: 'none',
        border: 'none',
        background: 'transparent',
        textAlign: 'center'
      }} //value={lines.join('\n')} onChange={this.handleChange}
      >
      </textarea>
    )
  }
}