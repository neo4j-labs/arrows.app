import React, {Component} from 'react'
import {Table, Icon} from 'semantic-ui-react'
import {getStyleEditorComponent} from "./editors/editorFactory";

export class StyleRow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mouseOver: false
    }
  }

  onMouseEnter = () => {
    this.setState({
      mouseOver: true
    })
  }

  onMouseLeave = () => {
    this.setState({
      mouseOver: false
    })
  }

  render = () => {
    const { styleKey, styleValue, onValueChange, onDeleteStyle, onNext, setFocusHandler} = this.props

    const handleKeyPress = (evt) => {
      if (evt.key === 'Enter') {
        onNext()
      }
    }

    return (
      <Table.Row onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <Table.Cell width={3} collapsing style={{padding: 0}}>
          <div
            style={{
              textAlign: 'right'
            }}
          >{styleKey}:</div>
        </Table.Cell>
        <Table.Cell width={3}>
          {getStyleEditorComponent(styleKey, styleValue, onValueChange, handleKeyPress, setFocusHandler)}
        </Table.Cell>
        <Table.Cell width={1}>
          <Icon
            style={{visibility: this.state.mouseOver ? 'visible' : 'hidden'}}
            name="trash alternate outline"
            onClick={onDeleteStyle}
          />
        </Table.Cell>
      </Table.Row>
    )
  }
}