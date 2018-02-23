import React, { Component } from 'react'
import { Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react'
import NodeEditor from './NodeEditor'

class SidebarLeftPush extends Component {
  render() {
    const { visible, item } = this.props
    return (
      <div>
        <Sidebar.Pushable as={Segment}>
          <Sidebar as={Menu} animation='push' width='wide' visible={visible} icon='labeled' vertical inverted>
            <NodeEditor item={item} />
          </Sidebar>
          <Sidebar.Pusher>
            <Segment basic>
              {this.props.children}
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    )
  }
}

export default SidebarLeftPush