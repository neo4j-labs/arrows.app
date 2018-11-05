import React from 'react'
import {Menu, Icon} from 'semantic-ui-react'

export const describeSelection = (selection, headerHeight) => {
  const parts = []

  const pushSelectionPart = (map, entityType, iconName) => {
    const length = Object.keys(map).length
    switch (length) {
      case 0:
        break

      default:
        parts.push(
          <Menu.Item
            style={{height: headerHeight + 'px'}}
            key={entityType}
          >
            <Icon name={iconName}/>
            {length}&nbsp;
            {entityType + (length > 1 ? 's' : '')}
          </Menu.Item>
        )
        break
    }
  }

  pushSelectionPart(selection.selectedNodeIdMap, "node", 'circle')
  pushSelectionPart(selection.selectedRelationshipIdMap, "relationship", 'long arrow alternate right')

  return parts
}
