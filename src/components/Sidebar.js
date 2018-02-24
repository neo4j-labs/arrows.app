import React, { Component } from 'react'
import { Sidebar, Segment, Menu } from 'semantic-ui-react'
import NodeEditor from './NodeEditor'
import {idsMatch} from "../model/Id";

class SidebarLeftPush extends Component {
  render() {
    const { visible, itemId, graph } = this.props
    const node = graph.nodes.find(item => idsMatch(item.id, itemId))
    return (
      <div>
        <Sidebar.Pushable as={Segment}>
          <Sidebar as={Menu} animation='push' width='wide' visible={visible} icon='labeled' vertical inverted>
            <NodeEditor item={node} />
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