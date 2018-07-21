import React, {Component} from 'react'
import {Form, Input, Button} from 'semantic-ui-react'
import { CompactPicker } from 'react-color'

export default class extends Component {
  state = {
    expanded: false
  }

  render () {
    const { value, onChange } = this.props
    const { expanded } = this.state

    return (
      <React.Fragment>
        <Form.Group widths='equal'>
          <Form.Field>
            <Input
              size='small'
              value={value}
              style={{ 'width': '5em', background: value, borderTopLeftRadius: '0.286em', borderBottomLeftRadius: '0.286em', paddingLeft: '0.5em' }}
              transparent
              onChange={evt => onChange(evt.target.value)}>
              <input />
              <Button
                style={{ borderRadius: '0', marginRight: '0' }}
                icon={this.state.expanded ? 'chevron up' : 'chevron down'}
                onClick={() => this.setState({ expanded: !this.state.expanded })}
              />
            </Input>
          </Form.Field>
        </Form.Group>
        <Form.Group widths='equal'>
          {expanded ?
            <CompactPicker
              color={value}
              onChangeComplete={color => {
                onChange(color.hex)
                this.setState({ expanded: false })
              }}
            /> : null
          }
        </Form.Group>
      </React.Fragment>
    )
  }
}