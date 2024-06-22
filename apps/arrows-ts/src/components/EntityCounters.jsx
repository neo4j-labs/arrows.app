import React from 'react';
import { Label, Icon, Form } from 'semantic-ui-react';

export const renderCounters = (nodeIds, relationshipIds, onSelect, color) => {
  const parts = [];

  const pushCounterPill = (ids, entityType, iconName) => {
    const length = ids.length;

    const selectOneEntityType = () => {
      const entities = ids.map((id) => ({ id, entityType }));
      onSelect(entities);
    };

    switch (length) {
      case 0:
        break;

      default:
        parts.push(
          <Label
            as="a"
            key={entityType}
            size="large"
            color={color}
            onClick={selectOneEntityType}
          >
            <Icon name={iconName} />
            {entityType + 's:'}
            <Label.Detail>{length}</Label.Detail>
          </Label>
        );
        break;
    }
  };

  pushCounterPill(nodeIds, 'node', 'circle');
  pushCounterPill(
    relationshipIds,
    'relationship',
    'long arrow alternate right'
  );

  return <Form.Field>{parts}</Form.Field>;
};
