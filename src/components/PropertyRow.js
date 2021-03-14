import React, {Component} from 'react'
import {Table, Input, Form, Icon, Popup, Button, Label} from 'semantic-ui-react'

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

    const keyPopupContent = (
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

    const suggestedValues = propertySummary.values.get(propertyKey)
      .filter(entry => entry.value !== valueFieldValue)
    const suggestedValuesInSelection = suggestedValues.filter(entry => entry.inSelection)
    const suggestedValuesInRestOfGraph = suggestedValues.filter(entry => !entry.inSelection)

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
            onClick={() => onValueChange(entry.value)}
          >
            {entry.value}
          </Button>
        </Table.Cell>
        <Table.Cell>
          <Label>{entry.nodeCount}</Label>
        </Table.Cell>
      </Table.Row>
    )

    const valuePopupContent = (
      <Form>
        {suggestedValuesInSelection.length > 0 ? (
          <Form.Field>
            <label>in selection</label>
            <Table basic='very' compact='very'>
              <Table.Body>
                {suggestedValuesInSelection.map(entryToSuggestion)}
              </Table.Body>
            </Table>
          </Form.Field>
        ) : null}
        {suggestedValuesInRestOfGraph.length > 0 ? (
          <Form.Field>
            <label>other values</label>
            <Table basic='very' compact='very'>
              <Table.Body>
                {suggestedValuesInRestOfGraph.map(entryToSuggestion)}
              </Table.Body>
            </Table>
          </Form.Field>
        ) : null}
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
      />
    )
    const valueField = (
      <Input
        value={valueFieldValue}
        placeholder={valueFieldPlaceHolder}
        onChange={(event) => onValueChange(event.target.value)}
        ref={elm => this.valueInput = elm}
        onKeyPress={(evt) => handleKeyPress('value', evt)}
        onKeyDown={handleKeyDown}
        transparent
        disabled={valueDisabled}
      />
    )
    return (
      <Table.Row onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <Table.Cell width={3} collapsing>
          <Form.Field>
            {propertySummary.keys.length > 0 ? (
              <Popup
                trigger={keyField}
                content={keyPopupContent}
                on='focus'
                position='bottom right'
                flowing
              />
            ) : keyField}:
          </Form.Field>
        </Table.Cell>
        <Table.Cell width={3}>
          <Form.Field>
            {suggestedValues.length > 0 ? (
              <Popup
                trigger={valueField}
                content={valuePopupContent}
                on='focus'
                position='bottom left'
                flowing
              />
            ) : valueField}
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
