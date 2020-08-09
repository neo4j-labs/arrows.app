import React, {Component} from 'react'
import {Table, Form, Input, Icon, Button, Popup} from 'semantic-ui-react'

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
    const { label, status, onAddLabel, onRenameLabel, onRemoveLabel } = this.props

    let valueCell = null

    if (status === 'PARTIAL') {
      const textBox = (
        <Input
          size='small'
          value=''
          placeholder='<partially present>'
          transparent
          style={{ 'width': '8em' }}
        />
      )
      const button = (
        <Button
          key='addLabel'
          onClick={onAddLabel}
          basic
          color='black'
          floated='right'
          size="tiny"
          content='Add to all nodes'
          type='button'
        />
      )
      valueCell = (
        <Form.Field>
          <Popup
            trigger={textBox}
            content={button}
            on='click'
            position='bottom center'
          />
        </Form.Field>
      )
    }

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
          {valueCell}
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