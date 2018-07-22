import React from 'react'
import {Form, Input, Popup} from 'semantic-ui-react'

export default ({value, onChange, min = 0, max = 100, step = 5}) => {
  const textBox = (
    <Input
      size='small'
      value={value}
      style={{'width': '8em'}}
      onChange={evt => onChange(Number(evt.target.value))}
    />
  )
  const slider = (
    <input
      type='range'
      min={min}
      max={max}
      step={step}
      value={value}
      style={{'width': '10em'}}
      onChange={evt => onChange(Number(evt.target.value))}
    />
  )
  return (
    <Form.Field>
      <Popup
        trigger={textBox}
        content={slider}
        on='click'
        position='bottom center'
      />
    </Form.Field>
  );
}