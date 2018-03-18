import React, { Component } from 'react'
import { Sidebar, Segment, Menu } from 'semantic-ui-react'
import Inspector from "./Inspector";

class SidebarLeftPush extends Component {
  render() {
    const visible = this.props.visible

    return (
      <div>
        <Sidebar.Pushable as={Segment}>
          <Sidebar as={Menu} animation='overlay' width='wide' visible={visible} icon='labeled' vertical inverted>
            <Inspector/>
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