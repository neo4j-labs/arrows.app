import React, { Component } from 'react'
import {Button, Form} from 'semantic-ui-react'
import {selectedNodeIds, selectedRelationshipIds} from "../model/selection";

const visibleMode = selection => {
  let visible = 0
  if (selectedNodeIds(selection).length > 0) {
    visible |= 1
  }
  if (selectedRelationshipIds(selection).length > 0) {
    visible |= 2
  }

  return visible
}

const NodeToolboxItems = (props) => null

const RelationshipToolboxItems = (props) => (
  <Button
    basic
    color='black'
    floated='right'
    size='tiny'
    icon="exchange"
    content='Reverse'
    onClick={props.onReverseRelationships}/>
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
        <Form.Field>
          <div>{/*common toolbox items will be here*/}</div>
          {children}
        </Form.Field>
      )
    } else {
      return null
    }
  }
}