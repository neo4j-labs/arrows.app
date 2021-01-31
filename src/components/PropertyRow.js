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

    return (
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
