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
    const type = this.props.visualRelationship.type
    const text = type.text
    const padding = 10
    const textWidth = type.width
    return (
      <input
        ref={this.input}
        value={text}
        onKeyDown={this.props.onKeyDown}
        onChange={this.handleChange}
        style={{
          position: 'absolute',
          padding: 0,
          left: type.boxPosition.x + type.borderWidth + type.padding,
          top: type.boxPosition.y,
          width: textWidth + padding,
          height: type.font.fontSize * 1.2,
          resize: 'none',
          outline: 'none',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          ...type.font,
          lineHeight: 1.2
        }}
      >
      </input>
    )
  }
}