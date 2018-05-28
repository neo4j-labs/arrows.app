import React from 'react'
import {Form, Input} from 'semantic-ui-react'

export default ({ caption, value, onChange, onDelete, min = 0, max=100, step=5 }) => (
  <React.Fragment>
    <Form.Group widths='equal' key={`form-group-style-${caption}`}>
      <Form.Field style={{ textAlign : 'right', fontSize: '1.1rem', alignSelf: 'center'}}>
        <span>{caption}</span>
      </Form.Field>
      <Form.Field>
        <Input
          size='small'
          value={value}
          style={{ 'width': '8em' }}
          onChange={evt => onChange(Number(evt.target.value))}
          action={{icon: 'close', onClick: onDelete}}
        />
      </Form.Field>
    </Form.Group>
    <Form.Group widths='equal' key={`form-group-style-${caption}-detail`}>
      <Form.Field></Form.Field>
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