import React, {Component} from 'react'
import {Input, Ref} from 'semantic-ui-react'

export class DiagramNameEditor extends Component {

  constructor(props) {
    super(props)
    this.state = {
      editable: false,
      diagramName: props.diagramName
    }
  }

  onClick = () => {
    this.setState({
      editable: true
    })
  }

  onChange = (event) => {
    this.setState({
      diagramName: event.target.value
    })
  }

  onBlur = () => {
    this.commit()
  }

  onKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.commit()
    }
  }

  commit = () => {
    this.setState({
      editable: false
    })
    this.props.setDiagramName(this.state.diagramName)
  }

  handleRef = (ref) => {
    this.ref = ref
  }

  render() {
    if (this.state.editable) {
      return (
        <Ref innerRef={this.handleRef}>
          <Input
            value={this.state.diagramName}
            onChange={this.onChange}
            onBlur={this.onBlur}
            onKeyPress={this.onKeyPress}
            transparent
          />
        </Ref>
      )
    } else {
      return (
        <span
          onClick={this.onClick}
        >{this.state.diagramName}</span>
      )
    }
  }

  componentDidUpdate() {
    if (this.ref) {
      const input = this.ref.querySelector('input');
      this.ref.style.width = input.scrollWidth + 'px'
      input.focus()
    }
  }
}