import React, {Component} from 'react'
import {Table, Form, Input, Icon, Button, Popup, Label} from 'semantic-ui-react'

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
    const { label, labelSummary, status, onAddLabel, onRenameLabel, onRemoveLabel } = this.props

    let valueCell = null

    if (status === 'PARTIAL') {
      valueCell = (
        <Form.Field>
          <Input
            size='small'
            value=''
            placeholder='<partially present>'
            transparent
          />
        </Form.Field>
      )
    }

    const entryToSuggestion = entry => (
      <Table.Row
        key={'suggest_' + entry.value}
        textAlign='left'
      >
        <Table.Cell>
          <Button
            basic
            color='black'
            size='tiny'
            onClick={() => onRenameLabel(entry.label)}
          >
            {entry.label}
          </Button>
        </Table.Cell>
        <Table.Cell>
          <Label>{entry.nodeCount}</Label>
        </Table.Cell>
      </Table.Row>
    )

    const popupContent = (
      <Form>
        {status === 'PARTIAL' ? (
          <Form.Field>
            <Button
              key='addLabel'
              onClick={onAddLabel}
              basic
              color='black'
              size="tiny"
              content='Add to all selected nodes'
              type='button'
            />
          </Form.Field>
        ) : null}
        {labelSummary.length > 0 ? (
          <Form.Field>
            <label>other labels</label>
            <Table basic='very' compact='very'>
              <Table.Body>
                {labelSummary.map(entryToSuggestion)}
              </Table.Body>
            </Table>
          </Form.Field>
        ) : null}
      </Form>
    )

    const labelField = (
      <Input
        value={label}
        onChange={(event) => onRenameLabel(event.target.value)}
        transparent
      />
    )

    return (
      <Table.Row onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <Table.Cell width={3} collapsing>
          <Form.Field>
            <Popup
              trigger={labelField}
              content={popupContent}
              on='focus'
              {...(labelSummary.length > 0 || status === 'PARTIAL' ? {} : {open: false})}
              position='bottom left'
              flowing
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