import React, {Component} from 'react'
import { Button, Popup, Menu } from 'semantic-ui-react'

export default class AddStyle extends Component {
  state = {isOpen: false}

  handleOpen = () => {
    this.setState({isOpen: true})
  }

  handleClose = () => {
    this.setState({isOpen: false})
    clearTimeout(this.timeout)
  }

  render() {
    const button = (
      <Button
        key='addProperty'
        basic
        floated='right'
        size="tiny"
        icon="plus"
        content='Style'
        disabled={this.props.styleKeys.length < 1}
      />
    )

    const menu = (
      <Menu text vertical>
        {this.props.styleKeys.map(styleKey => (
          <Menu.Item
            onClick={() => {
              this.setState({isOpen: false})
              this.props.onAddStyle(styleKey)
            }}
          >
            {styleKey}
          </Menu.Item>
        ))}
      </Menu>
    )

    return (
      <Popup
        trigger={button}
        content={menu}
        on='click'
        open={this.state.isOpen}
        onClose={this.handleClose}
        onOpen={this.handleOpen}
        position='top right'
      />
    )
  }
}