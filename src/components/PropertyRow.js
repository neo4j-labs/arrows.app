import React, {Component} from 'react'
import {Table, Input, Form, Icon, Popup, Button, List} from 'semantic-ui-react'

export class PropertyRow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mouseOver: false,
      focusKey: false,
      focusValue: false,
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

  onFocusKey = () => {
    this.setState({
      focusKey: true
    })
  }

  onBlurKey = () => {
    this.setState({
      focusKey: false
    })
  }

  onFocusValue = () => {
    this.setState({
      focusValue: true
    })
  }

  onBlurValue = () => {
    this.setState({
      focusValue: false
    })
  }
  
  componentDidMount () {
    if (!this.props.propertyKey || this.props.propertyKey.length === 0) {
      this.keyInput && this.keyInput.focus()
    }

    this.props.setFocusHandler(() => this.valueInput && this.valueInput.focus())
  }

  render = () => {
    const {
      propertyKey,
      onKeyChange,
      valueFieldValue,
      valueFieldPlaceHolder,
      onValueChange,
      onDeleteProperty,
      onNext,
      keyDisabled,
      valueDisabled
    } = this.props
    const handleKeyPress = (source, evt) => {
      if (evt.key === 'Enter') {
        evt.preventDefault()
        if (source === 'key') {
          this.valueInput && this.valueInput.focus()
        } else {
          onNext()
        }
      }
    }

    const handleKeyDown = (evt) => {
      if (evt.key === 'Enter' && evt.metaKey) {
        evt.target.blur()
      }
    }

    const globalPropertyKeys = [
      {key: 'name', nodeCount: 3},
      {key: 'title', nodeCount: 10},
      {key: 'born', nodeCount: 4}
    ]
    const propertyKeyButtons = globalPropertyKeys.map(entry => (
      <List.Item>
        <List.Content>
          <Button
            basic
            size='tiny'
          >
            {entry.key}
          </Button>
          &nbsp;{entry.nodeCount} nodes
        </List.Content>
      </List.Item>
    ))

    const buttons = this.state.focusKey ? (
      <Form>
        <Form.Field>
          <label>Keys in graph</label>
          <List>
            {propertyKeyButtons}
          </List>
        </Form.Field>
      </Form>
    ) : (
      <div>
        <Button
          key='convertCaptionsToLabels'
          basic
          color='black'
          floated='right'
          size="tiny"
          content='Values'
          type='button'
        />
      </div>
    )

    const row = (
      <Table.Row onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <Table.Cell width={3} collapsing>
          <Form.Field>
            <Input
              value={propertyKey}
              onChange={onKeyChange}
              transparent
              className={'property-key'}
              ref={elm => this.keyInput = elm}
              onKeyPress={(evt) => handleKeyPress('key', evt)}
              onKeyDown={handleKeyDown}
              disabled={keyDisabled}
              onFocus={this.onFocusKey}
              onBlur={this.onBlurKey}
            />:
          </Form.Field>
        </Table.Cell>
        <Table.Cell width={3}>
          <Form.Field>
            <Input
              value={valueFieldValue}
              placeholder={valueFieldPlaceHolder}
              onChange={onValueChange}
              ref={elm => this.valueInput = elm}
              onKeyPress={(evt) => handleKeyPress('value', evt)}
              onKeyDown={handleKeyDown}
              onFocus={this.onFocusValue}
              onBlur={this.onBlurValue}
              transparent
              disabled={valueDisabled}
            />
          </Form.Field>
        </Table.Cell>
        <Table.Cell width={1}>
          <Icon
            style={{visibility: this.state.mouseOver && !valueDisabled ? 'visible' : 'hidden'}}
            name="trash alternate outline"
            onClick={onDeleteProperty}
          />
        </Table.Cell>
      </Table.Row>
    )

    return (
      <Popup
        trigger={row}
        content={buttons}
        open={this.state.focusKey || this.state.focusValue}
        position={this.state.focusKey ? 'bottom left' : 'bottom right'}
        flowing
      />
    )
  }
}
