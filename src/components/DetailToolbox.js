import React from 'react'
import {Button, Form} from 'semantic-ui-react'
import {selectedNodeIds, selectedRelationshipIds, selectedRelationships} from "../model/selection";

export const DetailToolbox = (props) => {
  const relationshipToolboxItems = (
    <Button
      basic
      color='black'
      floated='right'
      size='tiny'
      icon="exchange"
      content='Reverse'
      onClick={() => props.onReverseRelationships(props.selection)}/>
  )

  const inlineRelationshipButton = (
    <Button
      basic
      color='black'
      floated='right'
      size='tiny'
      icon="columns"
      content='Inline as properties'
      onClick={() => props.onInlineRelationships(props.selection)}/>
  )

  const selectionToolboxItems = (
    <Button
      basic
      color='black'
      floated='right'
      size='tiny'
      icon="clone outline"
      content='Duplicate'
      onClick={props.onDuplicate}/>
  )

  const someRelationshipsSelected = selectedRelationshipIds(props.selection).length > 0
  const showInlineRelationshipsButton = shouldShowInlineRelationshipsButton(props.graph, props.selection)

  return (
    <Form.Field>
      {someRelationshipsSelected ? relationshipToolboxItems : null}
      {showInlineRelationshipsButton ? inlineRelationshipButton : null}
      {selectionToolboxItems}
    </Form.Field>
  )
}

const shouldShowInlineRelationshipsButton = (graph, selection) => {
  // only relationships selected
  if (selectedRelationshipIds(selection).length < 1 || selectedNodeIds(selection).length > 0) {
    return false
  }

  // disjoint source and target node sets
  const sourceNodeIds = new Set()
  const targetNodeIds = new Set()
  for (const relationship of selectedRelationships(graph, selection)) {
    sourceNodeIds.add(relationship.fromId)
    targetNodeIds.add(relationship.toId)
  }
  const intersection = new Set([...sourceNodeIds].filter(x => targetNodeIds.has(x)))
  if (intersection.size > 0) {
    return false
  }

  // all target nodes have properties
  for (const targetNodeId of targetNodeIds) {
    const targetNode = graph.nodes.find(node => node.id === targetNodeId)
    if (Object.entries(targetNode.properties).length === 0) {
      return false
    }
  }

  return true
}