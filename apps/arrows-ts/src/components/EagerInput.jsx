import React, { Component } from 'react';
import { Input } from 'semantic-ui-react';

const fireWhenIdle = (evt, onSave, delay = 1000) => {
  const target = evt.target;
  const timestamp = Date.now();
  target.expires = timestamp;
  setTimeout(() => {
    if (timestamp === target.expires) {
      onSave(target.value);
    }
  }, delay);
};

export default class EagerInput extends Component {
  state = { value: this.props.value };
  setValue(evt) {
    console.log('setValue');
    const { onSave, delay } = this.props;
    this.setState({ value: evt.target.value });
    onSave && fireWhenIdle(evt, onSave, delay);
  }
  render() {
    const { hidden, onSave, delay, ...rest } = this.props;

    if (hidden) {
      return null;
    }

    return (
      <Input
        {...rest}
        value={this.state.value}
        onChange={this.setValue.bind(this)}
      />
    );
  }
}
