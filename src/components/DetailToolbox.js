import React, { Component } from 'react'
import {Menu, Icon, Button } from 'semantic-ui-react'

const visibleMode = selection => {
  const { selectedNodeIdMap, selectedRelationshipIdMap } = selection
  let visible = 0
  if (selectedNodeIdMap && Object.keys(selectedNodeIdMap).length > 0) {
    visible |= 1
  }
  if (selectedRelationshipIdMap && Object.keys(selectedRelationshipIdMap).length > 0) {
    visible |= 2
  }

  return visible
}

const NodeToolboxItems = (props) => null

const RelationshipToolboxItems = (props) =>(
  <Menu.Item style={{fontSize: '.857rem'}}>
    <Button
      basic
      size='tiny'
      icon="exchange"
      content='Reverse'
      onClick={props.onReverseRelationships} />
  </Menu.Item>
)

export const DetailToolbox = (props) => (
  <ToolboxItems {...props}>
    {(visibleMode(props.selection) & 3) === 1 ? <ToolboxItems.NodeTools /> : null}
    {(visibleMode(props.selection) & 3) === 2 ? <ToolboxItems.RelationshipTools onReverseRelationships={() => props.onReverseRelationships(props.selection)} /> : null}
  </ToolboxItems>
)

class ToolboxItems extends Component {
  static NodeTools = NodeToolboxItems
  static RelationshipTools = RelationshipToolboxItems

  render () {
    const { selection, children } = this.props
    const visibility = selection && visibleMode(selection)

    // currently only show for relationships
    if ((visibility & 3) === 2) {
      return (
        <Menu
          borderless
          attached='top'
          style={{ borderRadius: 0, borderTop: 0, marginTop: 0, width: '100%' }}>
          <div>{/*common toolbox items will be here*/}</div>
          {children}
        </Menu>
      )
    } else {
      return null
    }
  }
}