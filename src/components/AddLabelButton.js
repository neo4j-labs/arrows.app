import React, {Component} from 'react'
import {Button, Popup, Input} from 'semantic-ui-react'

export class AddLabelButton extends Component {

  constructor(props) {
    super(props)
    this.state = {
      label: '',
      isOpen: false,
    }
  }

  handleOpen = () => {
    this.setState({isOpen: true})
  }

  handleClose = () => {
    this.setState({isOpen: false})
  }

  onChange = (event) => {
    this.setState({
      label: event.target.value
    })
  }

  onKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.commit()
    }
  }

  commit = () => {
    if (this.state.label.length > 0) {
      this.props.onAddLabel(this.state.label)
      this.setState({
        label: '',
        isOpen: false
      })
    }
  }

  render() {
    const button = (
      <Button
        key='addLabel'
        basic
        floated='right'
        size="tiny"
        icon="plus"
        content='Label'
        type='button'
      />
    )
    return (
      <Popup
        trigger={button}
        on='click'
        open={this.state.isOpen}
        onClose={this.handleClose}
        onOpen={this.handleOpen}
        position='bottom right'
      >
        <Input
          size='mini'
          value={this.state.label}
          action={<Button content='Add' onClick={this.commit}/>}
          placeholder='Label'
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
        />
      </Popup>
    )
  }
}