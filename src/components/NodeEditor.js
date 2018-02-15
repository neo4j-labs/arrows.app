import React from 'react'
import { Button, Checkbox, Form, Segment, Icon, Header } from 'semantic-ui-react'
import EagerInput from './EagerInput'

const NodeEditor = () => (
  <Segment inverted>
    <Header as='h2' icon>
      <Icon name='settings' />
      Node Settings
    </Header>
    <Form inverted style={{'textAlign': 'left'}}>
      <Form.Field>
        <label >Caption</label>
        <EagerInput onSave={(val) => console.log('VALUE', val)} placeholder='Node Caption' />
      </Form.Field>
      <Form.Field>
        <label>Name</label>
        <EagerInput placeholder='Name' />
      </Form.Field>
      <Button type='submit'>Submit</Button>
    </Form>
  </Segment>
)

export default NodeEditor
