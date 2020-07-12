import React, { Component } from 'react'
import {Button, Form} from 'semantic-ui-react'

export class GeneralToolbox extends Component {

  constructor(props) {
    super(props)
  }

  render () {
    const toolboxItems = (
      <Button
        basic
        floated='right'
        size='tiny'
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