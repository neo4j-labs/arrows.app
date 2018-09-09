import React from 'react'
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
  console.log(visible)
  return visible
}

export const DetailToolbox = (props) =>
  // currently show only for relationships
  (visibleMode(props.selection) & 3) === 2 ? (
    <React.Fragment>
      <Menu
        borderless
        attached='top'
        style={{borderRadius: 0, borderTop: 0, marginTop: 0, width: '100%'}}>
        <ToolboxItems/>
        {(visibleMode(props.selection) & 3) === 1 ? <NodeToolboxItems /> : null}
        {(visibleMode(props.selection) & 3) === 2 ? <RelationshipToolboxItems /> : null}
      </Menu>
    </React.Fragment>
  ) : null

const ToolboxItems = (props) => null

const NodeToolboxItems = (props) => null

const RelationshipToolboxItems = (props) =>(
  <Menu.Item style={{fontSize: '.857rem'}}>
    <Button size='tiny' basic icon>
      <Icon name='exchange' />
    </Button>
  </Menu.Item>
)