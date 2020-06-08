import React, {Component} from 'react';
import { Button } from 'semantic-ui-react'

export class LabelsEditor extends Component {

  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps.visualNode !== this.props.visualNode
  }

  render() {
    const nodeLabels = this.props.visualNode.labels
    const { visualNode, selection, onAddLabel, onRenameLabel } = this.props
    const padding = 10
    return (
      <div>
        {nodeLabels.pills.map((pill, index) => {
          const position = nodeLabels.pillPositions[index]
          const lineHeight = pill.font.fontSize * 1.2
          return (
            <input
              key={'pill-' + index}
              value={pill.text}
              onChange={(e) => onRenameLabel(selection, pill.text, e.target.value)}
              style={{
                position: 'absolute',
                padding: 0,
                left: position.x + pill.radius,
                top: position.y + pill.radius - lineHeight / 2,
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
        })}
        <Button
          basic
          key='addLabel'
          onClick={() => onAddLabel(selection, '')}
          size="tiny"
          icon="plus"
          content='Label'
          type='button'
          style={{
            position: 'absolute',
            left: visualNode.position.x,
            top: visualNode.position.y
          }}
        />
      </div>
    )
  }
}