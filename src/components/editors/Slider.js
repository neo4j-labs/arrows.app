import React from 'react'
import {Form, Input} from 'semantic-ui-react'

export default ({ caption, value, onValueChanged, min = 0, max=100, step=5 }) => (
  <Form.Group widths='equal' key={`form-group-style-${caption}`}>
    <Form.Field>
      <label>{caption}</label>
    </Form.Field>
    <Form.Field>
      <Input size='mini' style={{width: '45px'}} value={value} onChange={onValueChanged}/>
      <input type='range' min={min} max={max} step={step} value={value} onChange={onValueChanged}/>
    </Form.Field>
  </Form.Group>
)