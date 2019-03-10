import React, {Component} from 'react'
import {Table, Form, Input, Icon} from 'semantic-ui-react'

export class LabelRow extends Component {

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
    const { label, status, onRenameLabel, onRemoveLabel } = this.props

    return (
      <Table.Row onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <Table.Cell width={3} collapsing>
          <Form.Field>
            <Input
              value={label}
              onChange={onRenameLabel}
              transparent
            />
          </Form.Field>
        </Table.Cell>
        <Table.Cell width={3}>
          {status}
        </Table.Cell>
        <Table.Cell width={1}>
          <Icon
            style={{visibility: this.state.mouseOver ? 'visible' : 'hidden'}}
            name="trash alternate outline"
            onClick={onRemoveLabel}
          />
        </Table.Cell>
      </Table.Row>
    )
  }
}