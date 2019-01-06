import React, {Component} from 'react'
import {Label, Icon} from 'semantic-ui-react'

export class LabelPill extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mouseOver: false
    }
  }

  onMouseEnter = () => {
    this.setState({
      mouseOver: true
    })
  }

  onMouseLeave = () => {
    this.setState({
      mouseOver: false
    })
  }

  render = () => {
    const { label, status, onRemoveLabel } = this.props
    return (
      <Label
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        circular
        basic={status === 'CONSISTENT'}
      >
        &nbsp;{label}
        <Icon
          style={{visibility: this.state.mouseOver ? 'visible' : 'hidden'}}
          name='close'
          onClick={onRemoveLabel}
        />&nbsp;
      </Label>
    )
  }
}