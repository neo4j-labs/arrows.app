import find from 'lodash.find'
import { withProps } from 'react-recompose'

export const SELECT_ALL = 'SELECT_ALL'
export const DESELECT_ALL_NODES = 'DESELECT_ALL_NODES'
export const INVERT_SELECTION = 'INVERT_SELECTION'
export const DUPLICATE_SELECTION = 'DUPLICATE_SELECTION'
export const INSPECT = 'INSPECT'
export const ZOOM_IN = 'ZOOM_IN'
export const ZOOM_OUT = 'ZOOM_OUT'
export const DELETE_SELECTION = 'DELETE_SELECTION'
export const MOVE_LEFT = 'MOVE_LEFT'
export const MOVE_UP = 'MOVE_UP'
export const MOVE_RIGHT = 'MOVE_RIGHT'
export const MOVE_DOWN = 'MOVE_DOWN'
export const TOGGLE_FOCUS = 'TOGGLE_FOCUS'
export const UNDO = 'UNDO'
export const REDO = 'REDO'

const KeyBindings = {
  [SELECT_ALL]: [{ metaKey: true, code: 65 }],
  [DESELECT_ALL_NODES]: [{ metaKey: true, shiftKey: true, code: 65 }],
  [INVERT_SELECTION]: [{ metaKey: true, altKey: true, code: 65 }],
  [DUPLICATE_SELECTION]: [{ metaKey: true, code: 68 }],
  [INSPECT]: [{ metaKey: true, code: 73 }],
  [ZOOM_IN]: [{ metaKey: true, code: 187 }],
  [ZOOM_OUT]: [{ metaKey: true, code: 189 }],
  [DELETE_SELECTION]: [{ metaKey: false, code: 46 }, { metaKey: false, code: 8 }],
  [MOVE_LEFT]: [{ metaKey: false, shiftKey: 'optional', code: 37 }],
  [MOVE_UP]: [{ metaKey: false, shiftKey: 'optional', code: 38 }],
  [MOVE_RIGHT]: [{ metaKey: false, shiftKey: 'optional', code: 39 }],
  [MOVE_DOWN]: [{ metaKey: false, shiftKey: 'optional', code: 40 }],
  [TOGGLE_FOCUS]: [{ metaKey: false, code: 13, codeRange: {min: 48, max: 90}}],
  [UNDO]: [{metaKey: true, code: 90}],
  [REDO]: [{metaKey: true, shiftKey: true, code: 90}]
}

const actions = {}

export const isMac = navigator.appVersion.indexOf('Mac') !== -1

const findAction = ({ altKey, ctrlKey, metaKey, shiftKey, keyCode }) =>
  find(actions, ({bindings}) =>
    find(bindings, (binding) =>
      (keyCode === binding.code || (binding.codeRange && keyCode >= binding.codeRange.min && keyCode <= binding.codeRange.max)) &&
      (binding.altKey === 'optional' || altKey === !!binding.altKey) &&
      (binding.ctrlKey === 'optional' || ctrlKey === !!binding.ctrlKey || (!isMac && ctrlKey === !!binding.metaKey)) &&
      (binding.metaKey === 'optional' || metaKey === !!binding.metaKey || (!isMac && ctrlKey === !!binding.metaKey)) &&
      (binding.shiftKey === 'optional' || shiftKey === !!binding.shiftKey)
    )
  )

const hocProps = {
  registerAction: (name, handler) => (actions[name] = { bindings: KeyBindings[name], handler }),
  fireAction: (event, ...args) => {
    const action = findAction(event)
    if (action) {
      action.handler({
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey
      }, ...args)
    }

    return !!action
  }
}

export const getKeybindingString = name => {
  const binding = KeyBindings[name][0]
  let result = ''
  const addSymbol = symbol => (result += result.length > 0 ? ' ' + symbol : symbol)

  if (binding.shiftKey) addSymbol('⇧')
  if (binding.metaKey) addSymbol(isMac ? '⌘' : 'Ctrl')
  if (binding.altKey) addSymbol(isMac ? '⌥' : 'Alt')
  if (binding.ctrlKey) addSymbol(isMac ? '^' : '?')    // We shouldn't use this, windows only has two modifier keys

  result += ' ' + String.fromCharCode(binding.code)

  return result
}

export const registerKeybindings = actions => Component => props => {
  const processAction = action => {
    if (!action) throw new Error('Action not specified for Keybinding')
    const handler = typeof action.handler === 'function' ? action.handler(props) : action.handler
    hocProps.registerAction(action.name, handler)
  }

  actions.forEach(processAction)
  return Component(props)
}

export const ignoreTarget = ({target: { tagName }}) => tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'

export default withProps(hocProps)
