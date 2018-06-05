import React from 'react'
import {Form, Input} from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import Slider from './Slider'

export const getEditorComponent = ({ key, value, type='string', onChange, onKeyChange, onDelete, placeholder = key }) => {
  switch (type) {
    case 'size':
      return (<Slider
        key={'form-group-'+ key}
        caption={key}
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
      return getEditorComponent({ key: styleAttribute, value, type:'size', onChange, onDelete })
    case 'node-color':
      return getEditorComponent({ key: styleAttribute, value, type:'color', onChange, onDelete })
    case 'caption-color':
      return getEditorComponent({ key: styleAttribute, value, type:'color', onChange, onDelete })
    case 'caption-font-size':
      return getEditorComponent({ key: styleAttribute, value, type:'size', onChange, onDelete })
    default:
      return getEditorComponent({ key: styleAttribute, value, onChange, onDelete })
  }
}