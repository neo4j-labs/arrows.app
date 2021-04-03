import React from 'react'
import {Button, Form} from 'semantic-ui-react'
import {selectedRelationshipIds, selectedRelationships} from "../model/selection";

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
  const selectedRelationshipsDoNotFormPaths = disjointSourceAndTargetSets(props.graph, props.selection)

  return (
    <Form.Field>
      {someRelationshipsSelected ? relationshipToolboxItems : null}
      {someRelationshipsSelected && selectedRelationshipsDoNotFormPaths ? inlineRelationshipButton : null}
      {selectionToolboxItems}
    </Form.Field>
  )
}

const disjointSourceAndTargetSets = (graph, selection) => {
  const sourceNodeIds = new Set()
  const targetNodeIds = new Set()
  for (const relationship of selectedRelationships(graph, selection)) {
    sourceNodeIds.add(relationship.fromId)
    targetNodeIds.add(relationship.toId)
  }
  const intersection = new Set([...sourceNodeIds].filter(x => targetNodeIds.has(x)))
  return intersection.size === 0
}