import { Modal, Table, Header, Button, Icon } from 'semantic-ui-react';
import { shortcut } from '../interactions/platformKeys';
import { postToHost } from '../bridge/hostPost';
import {
  getKeybindingString,
  DELETE_SELECTION,
  DUPLICATE_SELECTION,
  SELECT_ALL,
  UNDO,
  REDO,
} from '../../interactions/Keybindings';

export const HELP_TOGGLE_KEY = '?';
export const isHelpToggle = (e: KeyboardEvent): boolean =>
  e.key === '?' || (e.key === '/' && (e.metaKey || e.ctrlKey));

interface ShortcutRow {
  label: string;
  keys: string;
}

interface Group {
  name: string;
  rows: ShortcutRow[];
}

// Reads keys for actions the web app already binds - staying in sync if those bindings change.
const bound = (name: string): string => getKeybindingString(name);

const GROUPS: Group[] = [
  {
    name: 'Tools',
    rows: [
      { label: 'Select tool', keys: 'V' },
      { label: 'Pan tool', keys: 'H' },
      { label: 'Pan (hold)', keys: 'Space' },
    ],
  },
  {
    name: 'Canvas',
    rows: [
      { label: 'Add node', keys: 'Double-click empty' },
      { label: 'Draw relationship', keys: 'Drag from node ring' },
      { label: 'Add to selection', keys: 'Shift+click' },
      { label: 'Select all', keys: bound(SELECT_ALL) },
      { label: 'Duplicate', keys: bound(DUPLICATE_SELECTION) },
      { label: 'Delete', keys: bound(DELETE_SELECTION) },
      { label: 'Undo', keys: bound(UNDO) },
      { label: 'Redo', keys: bound(REDO) },
      { label: 'Zoom', keys: 'Wheel' },
    ],
  },
  {
    name: 'Commands',
    rows: [
      { label: 'Show JSON side by side', keys: shortcut({ mod: 'cmd', key: 'K V' }) },
      { label: 'Auto-arrange nodes', keys: shortcut({ mod: 'shift+alt', key: 'F' }) },
      { label: 'Show this help', keys: HELP_TOGGLE_KEY },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EmbedShortcutsHelp({ open, onClose }: Props): JSX.Element {
  return (
    <Modal open={open} onClose={onClose} size="small" closeIcon dimmer="blurring">
      <Modal.Header>Keyboard shortcuts</Modal.Header>
      <Modal.Content scrolling>
        {GROUPS.map((group) => (
          <div key={group.name} style={{ marginBottom: 16 }}>
            <Header as="h4" style={{ marginBottom: 4 }}>{group.name}</Header>
            <Table compact basic="very" size="small">
              <Table.Body>
                {group.rows.map((row) => (
                  <Table.Row key={row.label}>
                    <Table.Cell>{row.label}</Table.Cell>
                    <Table.Cell textAlign="right">
                      <code>{row.keys}</code>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        ))}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => {
          postToHost({ type: 'command', name: 'arrows.openTutorial' });
          onClose();
        }}>
          <Icon name="play" /> Watch tutorial
        </Button>
        <Button primary onClick={onClose}>Close</Button>
      </Modal.Actions>
    </Modal>
  );
}
