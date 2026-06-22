import { Component } from 'react';
import withKeybindings, { ignoreTarget } from '../../interactions/Keybindings';

// Bubble-phase: forwards to arrows.app's registered actions. EmbedToolShortcuts
// runs in capture phase first and owns V/H/Space - see CLAUDE.md before
// adding another keydown listener.
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
