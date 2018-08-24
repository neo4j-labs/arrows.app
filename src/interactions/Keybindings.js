import find from 'lodash.find'
import { withProps } from 'recompose'

export const SELECT_ALL = 'SELECT_ALL'
export const DESELECT_ALL_NODES = 'DESELECT_ALL_NODES'
export const INVERT_SELECTION = 'INVERT_SELECTION'
export const DISMISS_SELECTION = 'DISMISS_SELECTION'
export const DISMISS_UNSELECTED = 'DISMISS_UNSELECTED'
export const INSPECT = 'INSPECT'
export const ZOOM_IN = 'ZOOM_IN'
export const ZOOM_OUT = 'ZOOM_OUT'
export const REMOVE_SELECTION_PATH = 'REMOVE_SELECTION_PATH'
export const DELETE_SELECTION = 'DELETE_SELECTION'
export const MOVE_LEFT = 'MOVE_LEFT'
export const MOVE_UP = 'MOVE_UP'
export const MOVE_RIGHT = 'MOVE_RIGHT'
export const MOVE_DOWN = 'MOVE_DOWN'

const KeyBindings = {
  [SELECT_ALL]: [{ metaKey: true, code: 65 }],
  [DESELECT_ALL_NODES]: [{ metaKey: true, shiftKey: true, code: 65 }],
  [INVERT_SELECTION]: [{ metaKey: true, altKey: true, code: 65 }],
  [DISMISS_SELECTION]: [{ metaKey: true, code: 68 }],
  [DISMISS_UNSELECTED]: [{ metaKey: true, shiftKey: true, code: 68 }],
  [INSPECT]: [{ metaKey: true, code: 73 }],
  [ZOOM_IN]: [{ metaKey: true, code: 187 }],
  [ZOOM_OUT]: [{ metaKey: true, code: 189 }],
  [REMOVE_SELECTION_PATH]: [{ metaKey: false, code: 27 }],
  [DELETE_SELECTION]: [{ metaKey: false, code: 46 }, { metaKey: false, code: 8 }],
  [MOVE_LEFT]: [{ metaKey: false, code: 37 }],
  [MOVE_UP]: [{ metaKey: false, code: 38 }],
  [MOVE_RIGHT]: [{ metaKey: false, code: 39 }],
  [MOVE_DOWN]: [{ metaKey: false, code: 40 }]
}

const actions = {}

const findAction = ({ altKey, ctrlKey, metaKey, shiftKey, keyCode }) =>
  find(actions, ({bindings}) =>
    find(bindings, (binding) =>
      keyCode === binding.code &&
      altKey === !!binding.altKey &&
      ctrlKey === !!binding.ctrlKey &&
      metaKey === !!binding.metaKey &&
      shiftKey === !!binding.shiftKey
    )
  )

const hocProps = {
  registerAction: (name, handler) => (actions[name] = { bindings: KeyBindings[name], handler }),
  fireAction: (event, ...args) => {
    const action = findAction(event)
    if (action) action.handler(...args)
    return !!action
  }
}

export const getKeybindingString = name => {
  const binding = KeyBindings[name]
  let result = ''
  const isMac = navigator.appVersion.indexOf('Mac') !== -1
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
