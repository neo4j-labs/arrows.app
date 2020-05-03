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
    const textWidth = caption.width
    return (
      <input
        ref={this.input}
        value={text}
        onChange={this.handleChange}
        style={{
          position: 'absolute',
          transform: `translate(${caption.offset.dx + caption.padding}px, ${caption.offset.dy}px) rotate(${caption.textAngle}rad)`,
          padding: 0,
          left: midPoint.x,
          top: midPoint.y,
          width: textWidth + padding,
          height: caption.font.fontSize * 1.2,
          resize: 'none',
          outline: 'none',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          ...caption.font,
          lineHeight: 1.2
        }}
      >
      </input>
    )
  }
}