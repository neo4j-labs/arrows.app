import React, {Component} from 'react'
import {Table, Input, Form, Icon} from 'semantic-ui-react'

export class PropertyRow extends Component {

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
    return (
      <Table.Row onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <Table.Cell width={3} collapsing>
          <Form.Field>
            <Input transparent className={'property-key'}/>:
          </Form.Field>
        </Table.Cell>
        <Table.Cell width={3}>
          <Form.Field>
            <Input transparent/>
          </Form.Field>
        </Table.Cell>
        <Table.Cell width={1}>
          <Icon style={{visibility: this.state.mouseOver ? 'visible' : 'hidden'}} name="trash outline"/>
        </Table.Cell>
      </Table.Row>
    )
  }
}