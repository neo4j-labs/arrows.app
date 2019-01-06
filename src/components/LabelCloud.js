import React, {Component} from 'react'
import { Form } from 'semantic-ui-react'
import {AddLabelButton} from "./AddLabelButton";
import {LabelPill} from "./LabelPill";

export default class LabelCloud extends Component {
  render() {
    const { labels, onAddLabel, onRemoveLabel } = this.props

    const rows = Object.keys(labels).map(label => {
      return (
        <LabelPill
          label={label}
          status={labels[label].status}
          onRemoveLabel={() => onRemoveLabel(label)}
        />
      )
    })
    return (
      <Form.Field key='labels'>
        <label>Labels</label>
        {rows}
        <AddLabelButton
          onAddLabel={onAddLabel}
        />
      </Form.Field>
    )
  }
}