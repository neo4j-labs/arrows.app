import React, {Component} from 'react'
import {Input} from 'semantic-ui-react'

export class DiagramNameEditor extends Component {

  constructor(props) {
    super(props)
    this.state = {
      diagramName: props.diagramName
    }
  }

  onChange = (event) => {
    this.setState({
      diagramName: event.target.value
    })
  }

  onBlur = () => {
    this.props.setDiagramName(this.state.diagramName)
  }

  render() {
    return (
      <Input
        value={this.state.diagramName}
        onChange={this.onChange}
        onBlur={this.onBlur}
        transparent
      />
    )
  }
}