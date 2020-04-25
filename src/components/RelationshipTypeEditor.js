import React, {PureComponent} from 'react';

export class RelationshipTypeEditor extends PureComponent {

  constructor(props) {
    super(props)
    this.input = React.createRef()
  }

  componentDidMount() {
    const input = this.input.current
    input.select()
  }

  handleChange = (e) => {
    const type = e.target.value
    this.props.onSetRelationshipType(type)
  }

  render() {
    const caption = this.props.visualRelationship.caption
    const text = caption.text
    const padding = 10
    const midPoint = caption.midPoint
    const textWidth = caption.textWidth
    return (
      <input
        ref={this.input}
        value={text}
        onChange={this.handleChange}
        style={{
          position: 'absolute',
          padding: 0,
          left: midPoint.x - (textWidth / 2 + padding),
          top: midPoint.y,
          width: textWidth,
          height: 20,
          resize: 'none',
          outline: 'none',
          border: 'none',
          background: 'transparent',
          textAlign: 'center',
          ...caption.font,
          lineHeight: 1.2
        }}
      >
      </input>
    )
  }
}