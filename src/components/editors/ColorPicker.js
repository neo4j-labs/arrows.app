import React, {Component} from 'react'
import {Form, Icon, Label} from 'semantic-ui-react'
import { SketchPicker } from 'react-color'

export default class extends Component {
  render () {
    const { caption='Color', value, onValueChanged, expanded=false, onToggle } = this.props
    return <Form.Group widths='equal' key={'form-group-style-color'}>
      <Form.Field>
        <label>{caption}</label>
      </Form.Field>
      <Form.Field>
        <div>
          <div>
            <Label style={{background : value}} onClick={onToggle}>
              <span>{value}</span>
              <Label.Detail><Icon name={expanded ? "chevron up" : "chevron down"}/></Label.Detail>
            </Label>
          </div>
          {expanded ?
            <SketchPicker
              color={value}
              onChangeComplete={color => onValueChanged(color.hex)}
            /> : null
          }
        </div>
      </Form.Field>
    </Form.Group>
  }
}