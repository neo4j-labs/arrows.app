import React, {Component} from 'react'
import {Form, Icon, Label} from 'semantic-ui-react'
import { SketchPicker } from 'react-color'

export default class extends Component {
  state = {
    expanded: false
  }

  render () {
    const { caption='Color', value, onChange } = this.props
    const { expanded } = this.state
    return <Form.Group widths='equal' key={'form-group-style-color'}>
      <Form.Field>
        <label>{caption}</label>
      </Form.Field>
      <Form.Field>
        <div>
          <div>
            <Label style={{background : value}} onClick={() => this.setState({expanded: !this.state.expanded})}>
              <span>{value}</span>
              <Label.Detail><Icon name={expanded ? "chevron up" : "chevron down"}/></Label.Detail>
            </Label>
          </div>
          {expanded ?
            <SketchPicker
              color={value}
              onChangeComplete={color => {
                onChange(color.hex)
                this.setState({expanded: false})
              }}
            /> : null
          }
        </div>
      </Form.Field>
    </Form.Group>
  }
}