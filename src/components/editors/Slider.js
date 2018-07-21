import React from 'react'
import {Form, Input, Dropdown} from 'semantic-ui-react'

export default ({ value, onChange, onDelete, min = 0, max=100, step=5 }) => (
  <React.Fragment>
    <Form.Group widths='equal'>
      <Form.Field>
        <Input
          size='small'
          value={value}
          style={{ 'width': '8em' }}
          onChange={evt => onChange(Number(evt.target.value))}
        />
      </Form.Field>
    </Form.Group>
    <Form.Group widths='equal'>
      <Form.Field>
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ 'width': '10em' }}
          onChange={evt => onChange(Number(evt.target.value))}/>
      </Form.Field>
    </Form.Group>
  </React.Fragment>
)