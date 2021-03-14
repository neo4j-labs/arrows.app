import React, {Component} from 'react'
import {Table, Input, Form, Icon, Popup, Button, Label} from 'semantic-ui-react'

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
      propertySummary,
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

    const propertyKeyButtons = propertySummary.keys
      .map(entry => (
        <Table.Row
          key={'suggest_' + entry.key}
          textAlign='right'
        >
          <Table.Cell>
            <Label>{entry.nodeCount}</Label>
          </Table.Cell>
          <Table.Cell>
            <Button
              basic
              color='black'
              size='tiny'
              onClick={() => onKeyChange(entry.key)}
            >
              {entry.key}
            </Button>
          </Table.Cell>
        </Table.Row>
      ))

    const buttons = (
      <Form>
        <Form.Field>
          <label>other property keys</label>
          <Table basic='very' compact='very'>
            <Table.Body>
              {propertyKeyButtons}
            </Table.Body>
          </Table>
        </Form.Field>
      </Form>
    )

    const keyField = (
      <Input
        value={propertyKey}
        onChange={(event) => onKeyChange(event.target.value)}
        transparent
        className={'property-key'}
        ref={elm => this.keyInput = elm}
        onKeyPress={(evt) => handleKeyPress('key', evt)}
        onKeyDown={handleKeyDown}
        disabled={keyDisabled}
        onFocus={this.onFocusKey}
        onBlur={this.onBlurKey}
      />
    )
    return (
      <Table.Row onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <Table.Cell width={3} collapsing>
          <Form.Field>
            <Popup
              trigger={keyField}
              content={buttons}
              on='focus'
              position={'bottom right'}
              flowing
            />:
          </Form.Field>
        </Table.Cell>
        <Table.Cell width={3}>
          <Form.Field>
            <Input
              value={valueFieldValue}
              placeholder={valueFieldPlaceHolder}
              onChange={(event) => onValueChange(event.target.value)}
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
  }
}
