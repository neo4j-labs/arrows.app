import React from 'react'
import {Button, Form} from 'semantic-ui-react'
import {selectedRelationshipIds} from "../model/selection";

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
  return (
    <Form.Field>
      {someRelationshipsSelected ? relationshipToolboxItems : null}
      {selectionToolboxItems}
    </Form.Field>
  )
}
