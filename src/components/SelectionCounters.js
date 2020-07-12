import React from 'react'
import {Label, Icon, Form} from 'semantic-ui-react'
import {selectedNodeIds, selectedRelationshipIds} from "../model/selection";

export const describeSelection = (selection) => {
  const parts = []

  const pushSelectionPart = (ids, entityType, iconName) => {
    const length = ids.length
    switch (length) {
      case 0:
        break

      default:
        parts.push(
          <Label as='a' key={entityType}>
            <Icon name={iconName}/>
            {length}&nbsp;
            {entityType + (length > 1 ? 's' : '')}
          </Label>
        )
        break
    }
  }

  pushSelectionPart(selectedNodeIds(selection), "node", 'circle')
  pushSelectionPart(selectedRelationshipIds(selection), "relationship", 'long arrow alternate right')

  return (
    <Form.Field>
      {parts}
    </Form.Field>
  )
}
