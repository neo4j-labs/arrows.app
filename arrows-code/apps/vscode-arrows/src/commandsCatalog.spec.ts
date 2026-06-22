import { describe, expect, it } from 'vitest';
import {
  COMMANDS,
  embedMenuPayload,
  sidebarQuickActions,
  webviewAllowedCommandIds,
} from './commandsCatalog';

describe('command catalog - surface filters', () => {
  it('webviewAllowedCommandIds contains every webview:true command and nothing else', () => {
    const expected = COMMANDS.filter((c) => c.webview).map((c) => c.id);
    expect([...webviewAllowedCommandIds].sort()).toEqual([...expected].sort());
  });

  it('sidebarQuickActions returns only commands with surface.sidebar=true', () => {
    const ids = sidebarQuickActions().map((c) => c.id);
    for (const c of COMMANDS) {
      if (c.surface.sidebar) expect(ids).toContain(c.id);
      else expect(ids).not.toContain(c.id);
    }
  });
});

describe('command catalog - embed menu payload', () => {
  it('only includes commands with surface.embedMenu=true AND webview=true', () => {
    const payloadIds = embedMenuPayload().map((e) => e.id);
    for (const c of COMMANDS) {
      const shouldInclude = c.surface.embedMenu && c.webview;
      expect(payloadIds.includes(c.id)).toBe(shouldInclude);
    }
  });

  it('payload mirrors title/description/icon from the source COMMAND entry verbatim', () => {
    for (const entry of embedMenuPayload()) {
      const source = COMMANDS.find((c) => c.id === entry.id);
      expect(source).toBeDefined();
      expect(entry.title).toBe(source!.title);
      expect(entry.description).toBe(source!.description);
      expect(entry.icon).toBe(source!.icon);
    }
  });
});
