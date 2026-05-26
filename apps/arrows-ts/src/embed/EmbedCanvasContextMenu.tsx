import { useEffect, useRef, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { Point } from '../model/Point';
import { createOrEditAt, editEntity, hitTestAt, selectAndPrepare, type HitResult } from './embedActions';
import { shortcut } from './platformKeys';
// @ts-expect-error JS module without .d.ts.
import { selectAll } from '../actions/selection';
// @ts-expect-error JS module.
import { deleteSelection, duplicateSelection, reverseRelationships } from '../actions/graph';

interface MenuState {
  x: number;
  y: number;
  canvasPos: { x: number; y: number };
  hit: HitResult;
}

type HostPost = (m: { type: string; [k: string]: unknown }) => void;

const postToHost: HostPost = (msg) => {
  const w = window as unknown as { __arrowsHostPost?: HostPost };
  try {
    if (w.__arrowsHostPost) w.__arrowsHostPost(msg);
    else window.parent.postMessage(msg, '*');
  } catch { /* host channel unavailable */ }
};

export function EmbedCanvasContextMenu() {
  const dispatch = useDispatch();
  const store = useStore();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== 'CANVAS') return;
      e.preventDefault();
      const rect = (target as HTMLCanvasElement).getBoundingClientRect();
      const canvasPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const rawHit = (dispatch as any)(hitTestAt(new Point(canvasPos.x, canvasPos.y))) as HitResult;
      // Right-click on a node's ring shows the same menu as the node itself — same entity.
      const hit: HitResult = rawHit.kind === 'nodeRing' ? { kind: 'node', id: rawHit.id } : rawHit;
      if (hit.kind !== 'none') (dispatch as any)(selectAndPrepare(hit));
      setMenu({ x: e.clientX, y: e.clientY, canvasPos, hit });
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

  const createNodeHere = run(() => dispatch(createOrEditAt(new Point(menu.canvasPos.x, menu.canvasPos.y)) as any));
  const selectEverything = run(() => dispatch(selectAll()));
  const exportSvg = run(() => postToHost({ type: 'command', name: 'arrows.exportSvg' }));
  const copyCypher = run(() => postToHost({ type: 'command', name: 'arrows.copyCypher' }));
  const exportCypher = run(() => postToHost({ type: 'command', name: 'arrows.exportCypher' }));
  const openInWebApp = run(() => postToHost({ type: 'command', name: 'arrows.openInArrowsApp' }));
  const editHit = run(() => menu.hit.kind !== 'none' && (dispatch as any)(editEntity(menu.hit)));
  const duplicateHit = run(() => dispatch(duplicateSelection()));
  const deleteHit = run(() => dispatch(deleteSelection()));
  const reverseHit = run(() => {
    const state = store.getState();
    dispatch(reverseRelationships(state.selection));
  });

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        left: menu.x,
        top: menu.y,
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
      }}
    >
      {menu.hit.kind === 'node' && (
        <>
          <MenuItem onClick={editHit} label="Edit caption" shortcut="Enter" icon={<EditIcon />} />
          <MenuItem onClick={duplicateHit} label="Duplicate" shortcut={shortcut({ mod: 'cmd', key: 'D' })} icon={<CopyIcon />} />
          <MenuItem onClick={deleteHit} label="Delete" shortcut="Del" icon={<TrashIcon />} danger />
          <Divider />
        </>
      )}
      {menu.hit.kind === 'relationship' && (
        <>
          <MenuItem onClick={editHit} label="Edit type" shortcut="Enter" icon={<EditIcon />} />
          <MenuItem onClick={reverseHit} label="Reverse direction" icon={<ReverseIcon />} />
          <MenuItem onClick={deleteHit} label="Delete" shortcut="Del" icon={<TrashIcon />} danger />
          <Divider />
        </>
      )}
      {menu.hit.kind === 'none' && (
        <>
          <MenuItem onClick={createNodeHere} label="New node here" shortcut="Double-click" icon={<PlusIcon />} />
          <MenuItem onClick={selectEverything} label="Select all" shortcut={shortcut({ mod: 'cmd', key: 'A' })} icon={<SelectAllIcon />} />
          <Divider />
        </>
      )}
      <MenuItem onClick={copyCypher} label="Copy as Cypher" icon={<ClipboardIcon />} />
      <MenuItem onClick={exportCypher} label="Export Cypher…" icon={<DatabaseIcon />} />
      <MenuItem onClick={exportSvg} label="Export SVG…" icon={<ImageIcon />} />
      <MenuItem onClick={openInWebApp} label="Open in arrows.app" icon={<ExternalIcon />} />
    </div>
  );
}

interface MenuItemProps {
  label: string;
  onClick: () => void;
  shortcut?: string;
  icon?: React.ReactNode;
  danger?: boolean;
}

function MenuItem({ label, onClick, shortcut, icon, danger }: MenuItemProps) {
  return (
    <div
      role="menuitem"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        color: danger ? '#c0392b' : '#222',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? '#fdf0ee' : '#f0f4ff'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#c0392b' : '#555' }}>
          {icon}
        </span>
        {label}
      </span>
      {shortcut && <span style={{ color: danger ? '#c0392b88' : '#888', fontSize: 11 }}>{shortcut}</span>}
    </div>
  );
}

const iconBase = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const PlusIcon = () => <svg {...iconBase}><path d="M12 5v14M5 12h14" /></svg>;
const SelectAllIcon = () => <svg {...iconBase}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 12h8M12 8v8" /></svg>;
const ClipboardIcon = () => <svg {...iconBase}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>;
const DatabaseIcon = () => <svg {...iconBase}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0" /></svg>;
const ImageIcon = () => <svg {...iconBase}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>;
const ExternalIcon = () => <svg {...iconBase}><path d="M15 3h6v6M10 14L21 3M21 14v7H3V3h7" /></svg>;
const EditIcon = () => <svg {...iconBase}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>;
const CopyIcon = () => <svg {...iconBase}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
const TrashIcon = () => <svg {...iconBase}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>;
const ReverseIcon = () => <svg {...iconBase}><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></svg>;

function Divider() {
  return <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />;
}
