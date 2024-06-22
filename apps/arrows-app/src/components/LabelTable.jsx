import React, { Component } from 'react';
import { Form, Button, Table } from 'semantic-ui-react';
import { LabelRow } from './LabelRow';

export default class LabelTable extends Component {
  render() {
    const { labels, onAddLabel, onRenameLabel, onRemoveLabel, labelSummary } =
      this.props;
    const addEmptyLabel = () => {
      onAddLabel('');
    };

    const rows = Object.keys(labels).map((label, index) => {
      return (
        <LabelRow
          key={'row-' + index}
          label={label}
          labelSummary={labelSummary}
          status={labels[label].status}
          onAddLabel={() => onAddLabel(label)}
          onRenameLabel={(newLabel) => onRenameLabel(label, newLabel)}
          onRemoveLabel={() => onRemoveLabel(label)}
        />
      );
    });
    return (
      <Form.Field key="labels">
        <label>Labels</label>
        <Table compact collapsing style={{ marginTop: 0 }}>
          <Table.Body>{rows}</Table.Body>
        </Table>
        <Button
          key="addLabel"
          onClick={addEmptyLabel}
          basic
          color="black"
          floated="right"
          size="tiny"
          icon="plus"
          content="Label"
          type="button"
        />
      </Form.Field>
    );
  }
}
