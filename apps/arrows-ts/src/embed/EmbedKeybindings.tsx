import { Component } from 'react';
// @ts-expect-error JS module without .d.ts — HOC adds fireAction prop.
import withKeybindings, { ignoreTarget } from '../interactions/Keybindings';

// LISTENER ORDERING CONTRACT (also documented in CLAUDE.md):
//  - EmbedToolShortcuts: capture-phase keydown on window. Owns V / H / Space.
//    Calls preventDefault + stopPropagation when it owns the key — beats this
//    bubble-phase listener and arrows' TOGGLE_FOCUS handler.
//  - EmbedKeybindings: bubble-phase keydown on window. Forwards to arrows'
//    registered actions (Delete, ⌘D, ⌘A, arrows, etc.).
// Don't add a third keydown listener. If you need a new chord, register it
// through arrows' Keybindings module (fireAction will pick it up) OR add it
// to EmbedToolShortcuts' capture-phase dispatch.
interface Props { fireAction: (ev: KeyboardEvent) => boolean }

class EmbedKeybindingsImpl extends Component<Props> {
  private onKeyDown = (ev: KeyboardEvent): void => {
    if (ignoreTarget(ev)) return;
    if (this.props.fireAction(ev)) { ev.preventDefault(); ev.stopPropagation(); }
  };
  componentDidMount(): void { window.addEventListener('keydown', this.onKeyDown); }
  componentWillUnmount(): void { window.removeEventListener('keydown', this.onKeyDown); }
  render(): null { return null; }
}

export const EmbedKeybindings = withKeybindings(EmbedKeybindingsImpl);
