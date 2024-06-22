import React, { Component } from 'react';
import { Form, Input, Popup } from 'semantic-ui-react';
import { CompactPicker } from 'react-color';

export default class extends Component {
  componentDidMount() {
    this.props.setFocusHandler(
      () => this.inputElement && this.inputElement.focus()
    );
  }
  render() {
    const { value, placeholder, onChange, onKeyPress } = this.props;

    const handleKeyDown = (evt) => {
      if (evt.key === 'Enter' && evt.metaKey) {
        evt.target.blur();
      }
    };

    const borderColour = value.length > 0 ? value : 'rgba(0,0,0,0)';

    const textBox = (
      <div>
        <Input
          size="small"
          value={value}
          placeholder={placeholder}
          style={{
            width: '8em',
            borderLeft: '17px solid ' + borderColour,
            paddingLeft: '5px',
          }}
          transparent
          onKeyPress={onKeyPress}
          onKeyDown={handleKeyDown}
          ref={(elm) => (this.inputElement = elm)}
          onChange={(evt) => onChange(evt.target.value)}
        />
      </div>
    );
    const picker = (
      <CompactPicker
        color={value}
        onChangeComplete={(color) => {
          onChange(color.hex);
        }}
      />
    );
    return (
      <Form.Field>
        <Popup
          trigger={textBox}
          content={picker}
          on="click"
          position="bottom center"
        />
      </Form.Field>
    );
  }
}
