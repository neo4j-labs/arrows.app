import React, {Component} from 'react'

const fireWhenIdle = (evt, onSave) => {
  const target = evt.target
  const timestamp = Date.now()
  target.expires = timestamp
  setTimeout(() => {
    if (timestamp === target.expires) {
      onSave(target.value)
    }
  }, 1000)
}

export default class EagerInput extends Component {
  state = { value: this.props.value}
  render() {
    return (
      <input value={this.state.value} onChange={(evt) => {
        this.setState({ value: evt.target.value })
        this.props.onSave && fireWhenIdle(evt, this.props.onSave)
      }}/>
    )
  }
}