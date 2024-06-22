import React, { Component } from 'react';
import { Form, Table } from 'semantic-ui-react';
import { StyleRow } from './StyleRow';

export default class StyleTable extends Component {
  constructor(props) {
    super(props);
    this.focusHandlers = [];
  }

  static styleInput(styleKey, specialised, style, graphStyle) {
    if (specialised) {
      switch (style[styleKey].status) {
        case 'CONSISTENT':
          return {
            styleValue: style[styleKey].value,
            styleValuePlaceholder: null,
          };

        default:
          return { styleValue: '', styleValuePlaceholder: '<various>' };
      }
    } else {
      return { styleValue: graphStyle[styleKey], styleValuePlaceholder: null };
    }
  }

  render() {
    const {
      title,
      style,
      graphStyle,
      possibleStyleAttributes,
      onSaveStyle,
      onDeleteStyle,
    } = this.props;

    const existingStyleAttributes = Object.keys(style);

    const rows = [];

    const onNextProperty = (nextIndex) => {
      if (nextIndex < existingStyleAttributes.length) {
        this.focusHandlers[nextIndex]();
      }
    };

    possibleStyleAttributes.forEach((styleKey, index) => {
      const specialised = style.hasOwnProperty(styleKey);
      const { styleValue, styleValuePlaceholder } = StyleTable.styleInput(
        styleKey,
        specialised,
        style,
        graphStyle
      );
      rows.push(
        <StyleRow
          key={styleKey}
          styleKey={styleKey}
          specialised={specialised}
          styleValue={styleValue}
          styleValuePlaceholder={styleValuePlaceholder}
          cachedImages={this.props.cachedImages}
          onValueChange={(value) => onSaveStyle(styleKey, value)}
          onDeleteStyle={() => onDeleteStyle(styleKey)}
          setFocusHandler={(action) => (this.focusHandlers[index] = action)}
          onNext={() => onNextProperty(index + 1)}
        />
      );
    });

    return (
      <Form.Field key="styleTable">
        <label>{title}</label>
        <Table compact collapsing style={{ marginTop: 0 }}>
          <Table.Body>{rows}</Table.Body>
        </Table>
      </Form.Field>
    );
  }
}
