import React, { Component } from 'react'
import {Button, Form} from 'semantic-ui-react'

export class GeneralToolbox extends Component {

  constructor(props) {
    super(props)
  }

  render () {
    const toolboxItems = (
      <Button
        primary
        floated='right'
        size='small'
        icon="circle"
        content='Add Node'
        onClick={this.props.onPlusNodeClick}/>
    )

    return (
      <Form.Field>
        {toolboxItems}
      </Form.Field>
    )
  }
}