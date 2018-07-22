import React, {Component} from 'react'
import {Table, Dropdown, Form, Icon} from 'semantic-ui-react'
import {getStyleEditorComponent} from "./editors/editorFactory";
import {nodeStyleAttributes} from "../model/styling";

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
    const { styleKey, styleValue, onValueChange, onDeleteStyle } = this.props

    const styleOptions = nodeStyleAttributes.map(styleAttribute => ({
      text: styleAttribute,
      value: styleAttribute
    }))

    return (
      <Table.Row onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <Table.Cell width={3} collapsing style={{padding: 0}}>
          <Form.Field>
            <Dropdown
              value={styleKey}
              inline
              search
              selection
              options={styleOptions}
              className={'property-key'}
              style={{border: 'none'}}
            />:
          </Form.Field>
        </Table.Cell>
        <Table.Cell width={3}>
          {getStyleEditorComponent(styleKey, styleValue, onValueChange)}
        </Table.Cell>
        <Table.Cell width={1}>
          <Icon
            style={{visibility: this.state.mouseOver ? 'visible' : 'hidden'}}
            name="trash outline"
            onClick={onDeleteStyle}
          />
        </Table.Cell>
      </Table.Row>
    )
  }
}