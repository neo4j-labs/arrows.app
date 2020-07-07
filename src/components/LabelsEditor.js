import React, {Component} from 'react';

export class LabelsEditor extends Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps.visualNode !== this.props.visualNode
  }

  render() {
    const nodeLabels = this.props.visualNode.labels
    const {selection, onRenameLabel} = this.props
    const padding = 10
    return nodeLabels.pills.map((pill, index) => {
      const position = nodeLabels.pillPositions[index]
      const lineHeight = pill.font.fontSize * 1.2
      return (
        <input
          key={'pill-' + index}
          value={pill.text}
          onKeyDown={this.props.onKeyDown}
          onChange={(e) => onRenameLabel(selection, pill.text, e.target.value)}
          style={{
            position: 'absolute',
            padding: 0,
            left: position.dx + pill.radius,
            top: position.dy + pill.radius - lineHeight / 2,
            width: pill.width + padding,
            height: lineHeight,
            resize: 'none',
            outline: 'none',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            ...pill.font,
            lineHeight: 1.2
          }}
        />
      )
    })
  }
}