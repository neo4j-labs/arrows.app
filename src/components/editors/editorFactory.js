import React from 'react'
import {Form, Input} from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import Slider from './Slider'

export const getEditorComponent = ({ key, value, type='string', onChange, onKeyChange, onDelete, placeholder = key }) => {
  switch (type) {
    case 'radius':
      return (<Slider
        key={'form-group-'+ key}
        caption='radius'
        value={value}
        onChange={onChange}
        onDelete={onDelete}
      />)
    case 'color':
      return (
        <ColorPicker
          key={'form-group-'+ key}
          value={value}
          onChange={onChange}
          onDelete={onDelete}
        />
      )
    case 'string':
    default:
      return (
        <Form.Group widths='equal' key={'form-group-'+ key}>
          <Form.Field>
            <Input fluid value={key} onChange={onKeyChange} label=':' labelPosition='right' className={'property-key'}/>
          </Form.Field>
          <Form.Field>
            <Input fluid value={value} placeholder={placeholder} onChange={onChange}
                   action={{icon: 'close', onClick: onDelete}}/>
          </Form.Field>
        </Form.Group>
      )
  }
}

export const getStyleEditorComponent = (styleAttribute, value, onChange, onDelete) => {
  switch (styleAttribute) {
    case 'radius':
      return getEditorComponent({ key: 'radius', value, type:'radius', onChange, onDelete })
    case 'color':
      return getEditorComponent({ key: 'color', value, type:'color', onChange, onDelete })
    default:
      return getEditorComponent({ key:styleAttribute, value, onChange, onDelete })
  }
}