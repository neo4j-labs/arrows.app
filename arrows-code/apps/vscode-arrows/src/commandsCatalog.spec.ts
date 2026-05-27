import { describe, expect, it } from 'vitest';
import {
  COMMANDS,
  embedMenuPayload,
  sidebarQuickActions,
  webviewAllowedCommandIds,
} from './commandsCatalog';

describe('command catalog — surface filters', () => {
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

describe('command catalog — embed menu payload', () => {
  it('only includes commands with surface.embedMenu=true AND webview=true', () => {
    const payloadIds = embedMenuPayload().map((e) => e.id);
    for (const c of COMMANDS) {
      const shouldInclude = c.surface.embedMenu && c.webview;
      expect(payloadIds.includes(c.id)).toBe(shouldInclude);
    }
  });

  it('every payload entry carries an icon field for the embed dropdown to render', () => {
    for (const entry of embedMenuPayload()) {
      expect(entry.icon, `${entry.id} missing icon`).toBeTruthy();
      expect(typeof entry.icon).toBe('string');
    }
  });

  it('exposes the new GraphQL export command on the embed menu', () => {
    const ids = embedMenuPayload().map((e) => e.id);
    expect(ids).toContain('arrows.exportGraphQL');
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
