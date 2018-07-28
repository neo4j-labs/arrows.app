import React, {Component} from 'react'
import { Form, Table } from 'semantic-ui-react'
import {nodeStyleAttributes, relationshipStyleAttributes} from "../model/styling";
import {StyleRow} from "./StyleRow";
import AddStyle from "./AddStyle";

export default class StyleTable extends Component {

  render() {
    const { style, graphStyle, selectionIncludes, onSaveStyle, onDeleteStyle } = this.props

    const existingStyleAttributes = Object.keys(style)
    const possibleStyleAttributes = []
      .concat(selectionIncludes.nodes ? nodeStyleAttributes : [])
      .concat(selectionIncludes.relationships ? relationshipStyleAttributes : [])

    const availableStyleAttributes = possibleStyleAttributes.filter(styleAttr => !existingStyleAttributes.includes(styleAttr))
    const rows = []

    Object.keys(style).sort().forEach(styleKey => {
      const styleValue = style[styleKey].status === 'CONSISTENT' ?  style[styleKey].value : graphStyle[styleKey]
      rows.push((
          <StyleRow
            key={styleKey}
            styleKey={styleKey}
            styleValue={styleValue}
            onValueChange={value => onSaveStyle(styleKey, value)}
            onDeleteStyle={() => onDeleteStyle(styleKey)}
          />
        )
      )
    })

    return (
      <Form.Field key='styleTable'>
        <label>Style</label>
        <Table compact collapsing style={{marginTop: 0}}>
          <Table.Body>
            {rows}
          </Table.Body>
        </Table>
        <AddStyle
          styleKeys={availableStyleAttributes}
          onAddStyle={(styleKey) => {
            onSaveStyle(styleKey, graphStyle[styleKey])
          }}
        />
      </Form.Field>
    )
  }
}