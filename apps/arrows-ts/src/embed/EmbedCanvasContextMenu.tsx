import { useEffect, useRef, useState } from 'react';
import { useStore } from 'react-redux';
import { Icon, type SemanticICONS } from 'semantic-ui-react';
import { Point } from '../model/Point';
import { createOrEditAt, editEntity, hitTestAt, selectAndPrepare, type HitResult } from './embedActions';
import { shortcut } from './platformKeys';
import { canvasPosOf } from './canvasPos';
import { postToHost } from './hostPost';
import { useAppDispatch } from './store';
import { selectAll } from '../actions/selection';
import { deleteSelection, duplicateSelection, reverseRelationships } from '../actions/graph';

interface MenuState {
  x: number;
  y: number;
  canvasPos: Point;
  hit: HitResult;
}

const menuStyle: React.CSSProperties = {
  position: 'fixed',
  zIndex: 10000,
  background: '#fff',
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
  minWidth: 200,
  fontFamily: 'sans-serif',
  fontSize: 13,
  padding: '4px 0',
  userSelect: 'none',
};

const itemStyleBase: React.CSSProperties = {
  padding: '6px 14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
};

export function EmbedCanvasContextMenu() {
  const dispatch = useAppDispatch();
  const store = useStore();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      const found = canvasPosOf(e);
      if (!found) return;
      e.preventDefault();
      const rawHit = dispatch(hitTestAt(found.pos));
      // Right-click on a node's ring shows the same menu as the node itself — same entity.
      const hit: HitResult = rawHit.kind === 'nodeRing' ? { kind: 'node', id: rawHit.id } : rawHit;
      if (hit.kind !== 'none') dispatch(selectAndPrepare(hit));
      setMenu({ x: e.clientX, y: e.clientY, canvasPos: found.pos, hit });
    };
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    };
    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [dispatch, store]);

  if (!menu) return null;

  const close = () => setMenu(null);
  const run = (fn: () => void) => () => { fn(); close(); };

  const createNodeHere = run(() => dispatch(createOrEditAt(menu.canvasPos)));
  const selectEverything = run(() => dispatch(selectAll()));
  const exportSvg = run(() => postToHost({ type: 'command', name: 'arrows.exportSvg' }));
  const copyCypher = run(() => postToHost({ type: 'command', name: 'arrows.copyCypher' }));
  const exportCypher = run(() => postToHost({ type: 'command', name: 'arrows.exportCypher' }));
  const openInWebApp = run(() => postToHost({ type: 'command', name: 'arrows.openInArrowsApp' }));
  const editHit = run(() => { if (menu.hit.kind !== 'none') dispatch(editEntity(menu.hit)); });
  const duplicateHit = run(() => dispatch(duplicateSelection()));
  const deleteHit = run(() => dispatch(deleteSelection()));
  const reverseHit = run(() => {
    const state = store.getState() as { selection: unknown };
    dispatch(reverseRelationships(state.selection));
  });

  return (
    <div ref={menuRef} role="menu" style={{ ...menuStyle, left: menu.x, top: menu.y }}>
      {menu.hit.kind === 'node' && (
        <>
          <MenuItem onClick={editHit} label="Edit caption" shortcut="Enter" icon="edit outline" />
          <MenuItem onClick={duplicateHit} label="Duplicate" shortcut={shortcut({ mod: 'cmd', key: 'D' })} icon="copy outline" />
          <MenuItem onClick={deleteHit} label="Delete" shortcut="Del" icon="trash alternate outline" danger />
          <Divider />
        </>
      )}
      {menu.hit.kind === 'relationship' && (
        <>
          <MenuItem onClick={editHit} label="Edit type" shortcut="Enter" icon="edit outline" />
          <MenuItem onClick={reverseHit} label="Reverse direction" icon="exchange" />
          <MenuItem onClick={deleteHit} label="Delete" shortcut="Del" icon="trash alternate outline" danger />
          <Divider />
        </>
      )}
      {menu.hit.kind === 'none' && (
        <>
          <MenuItem onClick={createNodeHere} label="New node here" shortcut="Double-click" icon="plus" />
          <MenuItem onClick={selectEverything} label="Select all" shortcut={shortcut({ mod: 'cmd', key: 'A' })} icon="object group outline" />
          <Divider />
        </>
      )}
      <MenuItem onClick={copyCypher} label="Copy as Cypher" icon="clipboard outline" />
      <MenuItem onClick={exportCypher} label="Export Cypher…" icon="database" />
      <MenuItem onClick={exportSvg} label="Export SVG…" icon="image outline" />
      <MenuItem onClick={openInWebApp} label="Open in arrows.app" icon="external alternate" />
    </div>
  );
}

interface MenuItemProps {
  label: string;
  onClick: () => void;
  shortcut?: string;
  icon?: SemanticICONS;
  danger?: boolean;
}

function MenuItem({ label, onClick, shortcut, icon, danger }: MenuItemProps) {
  return (
    <div
      role="menuitem"
      onClick={onClick}
      style={{ ...itemStyleBase, color: danger ? '#c0392b' : '#222' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? '#fdf0ee' : '#f0f4ff'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        {icon && <Icon name={icon} style={{ color: danger ? '#c0392b' : '#555', margin: 0 }} />}
        {label}
      </span>
      {shortcut && <span style={{ color: danger ? '#c0392b88' : '#888', fontSize: 11 }}>{shortcut}</span>}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />;
}
