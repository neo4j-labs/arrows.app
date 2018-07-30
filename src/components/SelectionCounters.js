import React from 'react'
import {Label} from 'semantic-ui-react'

export const describeSelection = (selection) => {
  const parts = []

  const pushSelectionPart = (map, entityType) => {
    const length = Object.keys(map).length
    switch (length) {
      case 0:
        break

      default:
        parts.push(
          <Label
            key={entityType}
            basic
            color='black'
            pointing='left'
            style={{margin: 0}}>
            {length}
            <Label.Detail>{entityType + (length > 1 ? 's' : '')}</Label.Detail>
          </Label>
        )
        break
    }
  }

  pushSelectionPart(selection.selectedNodeIdMap, "node")
  pushSelectionPart(selection.selectedRelationshipIdMap, "relationship")

  if (parts.length > 0) {
    return (
      <Label.Group>
        {parts}
      </Label.Group>
    )
  } else {
    return 'Graph'
  }
}
