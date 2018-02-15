import React from 'react'

const fireWhenIdle = (evt, onSave) => {
  const target = evt.target
  const timestamp = Date.now()
  target.expires = timestamp
  setTimeout(() => {
    if (timestamp === target.expires) {
      onSave(target.value)
    }
  }, 2000)
}

export default ({onSave, ...props}) => {
  return <input {...props} onChange={(evt) => onSave && fireWhenIdle(evt, onSave)} />
}