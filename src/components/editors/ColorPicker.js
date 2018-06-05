import React, {Component} from 'react'
import {Form, Input, Button} from 'semantic-ui-react'
import { CompactPicker } from 'react-color'

export default class extends Component {
  state = {
    expanded: false
  }

  render () {
    const { caption, value, onChange, onDelete } = this.props
    const { expanded } = this.state

    return (
      <React.Fragment>
        <Form.Group widths='equal' key={`form-group-style-${caption}`}>
          <Form.Field style={{ textAlign: 'right', fontSize: '1.1rem', alignSelf: 'center' }}>
            <span>{caption}</span>
          </Form.Field>
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
              <Button onClick={onDelete} icon='close' style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0', marginRight: '0'}}/>
            </Input>
          </Form.Field>
        </Form.Group>
        <Form.Group widths='equal' key={`form-group-style-${caption}-detail`}>
          <Form.Field></Form.Field>
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