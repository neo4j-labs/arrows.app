import React, { Component } from 'react';
import { Form, Input, Popup } from 'semantic-ui-react';
import { validate } from '../../model/styling';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numericValue: props.value,
      stringValue: props.value + '',
    };
  }

  componentDidMount() {
    this.props.setFocusHandler(
      () => this.inputElement && this.inputElement.focus()
    );
  }

  static getDerivedStateFromProps(props, state) {
    if (state.numericValue !== props.value) {
      return {
        numericValue: props.value,
        stringValue: props.value + '',
      };
    }
    return state;
  }

  onChange(stringValue) {
    const numericValue = Number(stringValue);
    if (validate(this.props.styleKey, numericValue) === numericValue) {
      this.setState({
        numericValue,
        stringValue,
      });
      this.props.onChange(numericValue);
    } else {
      this.setState({
        stringValue,
      });
    }
  }

  render() {
    const { placeholder, min, max, step, onKeyPress } = this.props;

    const handleKeyDown = (evt) => {
      if (evt.key === 'Enter' && evt.metaKey) {
        evt.target.blur();
      }
    };

    const sizeToSlide = (size) => {
      return Math.round(
        (100 * (Math.log(size + 1) - Math.log(min + 1))) /
          (Math.log(max + 1) - Math.log(min + 1))
      );
    };

    const slideToSize = (slide) => {
      const rawSize =
        Math.exp(
          (slide * (Math.log(max + 1) - Math.log(min + 1))) / 100 +
            Math.log(min + 1)
        ) - 1;
      return rawSize > step
        ? Math.round(rawSize / step) * step
        : Math.round(rawSize);
    };

    const textBox = (
      <Input
        size="small"
        value={this.state.stringValue}
        placeholder={placeholder}
        transparent
        style={{ width: '8em' }}
        onKeyPress={onKeyPress}
        onKeyDown={handleKeyDown}
        ref={(elm) => (this.inputElement = elm)}
        onChange={(evt) => this.onChange(evt.target.value)}
      />
    );
    const slider = (
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={sizeToSlide(this.state.numericValue)}
        style={{ width: '10em' }}
        onChange={(evt) => this.onChange(slideToSize(Number(evt.target.value)))}
      />
    );
    return (
      <Form.Field>
        <Popup
          trigger={textBox}
          content={slider}
          on="click"
          position="bottom center"
        />
      </Form.Field>
    );
  }
}
