import { withProps } from 'react-recompose';

export const SELECT_ALL = 'SELECT_ALL';
export const DESELECT_ALL_NODES = 'DESELECT_ALL_NODES';
export const INVERT_SELECTION = 'INVERT_SELECTION';
export const DUPLICATE_SELECTION = 'DUPLICATE_SELECTION';
export const INSPECT = 'INSPECT';
export const ZOOM_IN = 'ZOOM_IN';
export const ZOOM_OUT = 'ZOOM_OUT';
export const DELETE_SELECTION = 'DELETE_SELECTION';
export const MOVE_LEFT = 'MOVE_LEFT';
export const MOVE_UP = 'MOVE_UP';
export const MOVE_RIGHT = 'MOVE_RIGHT';
export const MOVE_DOWN = 'MOVE_DOWN';
export const TOGGLE_FOCUS = 'TOGGLE_FOCUS';
export const UNDO = 'UNDO';
export const REDO = 'REDO';

export type WordyBoolean = boolean | 'optional';

export type KeyBinding = {
  code: number;
  altKey?: WordyBoolean;
  ctrlKey?: boolean | 'optional';
  metaKey?: boolean | 'optional';
  shiftKey?: boolean | 'optional';
  codeRange?: { min: number; max: number };
};

const KeyBindings: Record<string, KeyBinding[]> = {
  [SELECT_ALL]: [{ metaKey: true, code: 65 }],
  [DESELECT_ALL_NODES]: [{ metaKey: true, shiftKey: true, code: 65 }],
  [INVERT_SELECTION]: [{ metaKey: true, altKey: true, code: 65 }],
  [DUPLICATE_SELECTION]: [{ metaKey: true, code: 68 }],
  [INSPECT]: [{ metaKey: true, code: 73 }],
  [ZOOM_IN]: [{ metaKey: true, code: 187 }],
  [ZOOM_OUT]: [{ metaKey: true, code: 189 }],
  [DELETE_SELECTION]: [
    { metaKey: false, code: 46 },
    { metaKey: false, code: 8 },
  ],
  [MOVE_LEFT]: [{ metaKey: false, shiftKey: 'optional', code: 37 }],
  [MOVE_UP]: [{ metaKey: false, shiftKey: 'optional', code: 38 }],
  [MOVE_RIGHT]: [{ metaKey: false, shiftKey: 'optional', code: 39 }],
  [MOVE_DOWN]: [{ metaKey: false, shiftKey: 'optional', code: 40 }],
  [TOGGLE_FOCUS]: [
    { metaKey: false, code: 13, codeRange: { min: 48, max: 90 } },
  ],
  [UNDO]: [{ metaKey: true, code: 90 }],
  [REDO]: [{ metaKey: true, shiftKey: true, code: 90 }],
};

export type KeyboardState = {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
};

export type KeyboardEventHandler = (
  keyboardState: KeyboardState,
  args: unknown[]
) => void;

export type KeyboardAction = {
  name: string;
  handler: KeyboardEventHandler;
  bindings: Array<{
    altKey?: boolean | 'optional';
    ctrlKey?: boolean | 'optional';
    metaKey?: boolean | 'optional';
    shiftKey?: boolean | 'optional';
    code: number;
    codeRange?: { min: number; max: number };
  }>;
};

const actions: Record<string, KeyboardAction> = {};

export const isMac = navigator.appVersion.indexOf('Mac') !== -1;

const findAction = ({
  altKey,
  ctrlKey,
  metaKey,
  shiftKey,
  keyCode,
}: KeyboardEvent) =>
  Object.values(actions).find(({ bindings }) =>
    bindings.find(
      (binding) =>
        (keyCode === binding.code ||
          (binding.codeRange &&
            keyCode >= binding.codeRange.min &&
            keyCode <= binding.codeRange.max)) &&
        (binding.altKey === 'optional' || altKey === !!binding.altKey) &&
        (binding.ctrlKey === 'optional' ||
          ctrlKey === !!binding.ctrlKey ||
          (!isMac && ctrlKey === !!binding.metaKey)) &&
        (binding.metaKey === 'optional' ||
          metaKey === !!binding.metaKey ||
          (!isMac && ctrlKey === !!binding.metaKey)) &&
        (binding.shiftKey === 'optional' || shiftKey === !!binding.shiftKey)
    )
  );

// find(actions, ({bindings}) =>
//   find(bindings, (binding) =>
//     (keyCode === binding.code || (binding.codeRange && keyCode >= binding.codeRange.min && keyCode <= binding.codeRange.max)) &&
//     (binding.altKey === 'optional' || altKey === !!binding.altKey) &&
//     (binding.ctrlKey === 'optional' || ctrlKey === !!binding.ctrlKey || (!isMac && ctrlKey === !!binding.metaKey)) &&
//     (binding.metaKey === 'optional' || metaKey === !!binding.metaKey || (!isMac && ctrlKey === !!binding.metaKey)) &&
//     (binding.shiftKey === 'optional' || shiftKey === !!binding.shiftKey)
//   )
// )

const hocProps = {
  registerAction: (name: string, handler: KeyboardEventHandler) =>
    (actions[name] = { name, bindings: KeyBindings[name], handler }),
  fireAction: (event: KeyboardEvent, ...args: unknown[]) => {
    const action = findAction(event);
    if (action) {
      action.handler(
        {
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
        },
        args
      );
    }

    return !!action;
  },
};

export const getKeybindingString = (name: string) => {
  const binding = KeyBindings[name][0];
  let result = '';
  const addSymbol = (symbol: string) =>
    (result += result.length > 0 ? ' ' + symbol : symbol);

  if (binding.shiftKey) addSymbol('⇧');
  if (binding.metaKey) addSymbol(isMac ? '⌘' : 'Ctrl');
  if (binding.altKey) addSymbol(isMac ? '⌥' : 'Alt');
  if (binding.ctrlKey) addSymbol(isMac ? '^' : '?'); // We shouldn't use this, windows only has two modifier keys

  result += ' ' + String.fromCharCode(binding.code);

  return result;
};

// ABK: This does not appear to be used anywhere. I'm commenting it out for now.
//
// export const registerKeybindings = (actions:KeyboardAction[]) => (Component:JSX.Element) => (props:unknown) => {
//   const processAction = (action:KeyboardAction) => {
//     if (!action) throw new Error('Action not specified for Keybinding')
//     const handler = typeof action.handler === 'function' ? action.handler(props) : action.handler
//     hocProps.registerAction(action.name, handler)
//   }

//   actions.forEach(processAction)
//   return Component(props)
// }

export const ignoreTarget = (ev: Event) => {
  const tagName =
    ev.target !== null ? (ev.target as HTMLElement).tagName : 'NO_ELEMENT';
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
};

export default withProps(hocProps);
