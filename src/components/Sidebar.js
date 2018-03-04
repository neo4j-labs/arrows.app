import React, { Component } from 'react'
import { Sidebar, Segment, Menu } from 'semantic-ui-react'
import NodeEditor from './NodeEditor'
import RelationshipEditor from './RelationshipEditor'
import {idsMatch} from "../model/Id";

class SidebarLeftPush extends Component {
  render() {
    const { sidebarData, graph, visible } = this.props
    const { itemId, mode  } = sidebarData
    let editorElement
    if (mode === 'edit-node') {
      const node = graph.nodes.find(item => idsMatch(item.id, itemId))
      editorElement  = <NodeEditor item={node} />
    } else if (mode === 'edit-relationship') {
      const node = graph.relationships.find(item => idsMatch(item.id, itemId))
      editorElement  = <RelationshipEditor item={node} />
    }

    return (
      <div>
        <Sidebar.Pushable as={Segment}>
          <Sidebar as={Menu} animation='push' width='wide' visible={visible} icon='labeled' vertical inverted>
            {editorElement}
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