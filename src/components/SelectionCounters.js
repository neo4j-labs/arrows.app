import React from 'react'
import {Menu, Icon} from 'semantic-ui-react'
import {selectedNodeIds, selectedRelationshipIds} from "../model/selection";

export const describeSelection = (selection, headerHeight) => {
  const parts = []

  const pushSelectionPart = (ids, entityType, iconName) => {
    const length = ids.length
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

  pushSelectionPart(selectedNodeIds(selection), "node", 'circle')
  pushSelectionPart(selectedRelationshipIds(selection), "relationship", 'long arrow alternate right')

  return parts
}
