import { describe, expect, it, vi } from 'vitest';
import { join } from 'node:path';

vi.mock('vscode', () => {
  class Uri {
    constructor(public readonly fsPath: string, public readonly scheme = 'file', public readonly path = fsPath) {}
    static file(p: string): Uri { return new Uri(p, 'file', p); }
    static joinPath(base: Uri, ...rest: string[]): Uri {
      return Uri.file(join(base.fsPath, ...rest));
    }
    static parse(s: string): Uri {
      const [scheme, rest] = s.split(':', 2);
      return new Uri(rest ?? s, scheme ?? 'file', rest ?? s);
    }
  }
  return {
    Uri,
    workspace: { workspaceFolders: undefined as Array<{ uri: Uri }> | undefined },
    window: {},
  };
});

import * as vscode from 'vscode';
import { defaultExportUri, msg, toUri, workspaceTargetUri } from './helpers';

const uri = (p: string): vscode.Uri =>
  (vscode.Uri as unknown as { file: (p: string) => vscode.Uri }).file(p);

describe('msg', () => {
  it('returns the message of an Error', () => {
    expect(msg(new Error('boom'))).toBe('boom');
  });
  it('coerces non-Error values to string', () => {
    expect(msg('plain')).toBe('plain');
    expect(msg(42)).toBe('42');
    expect(msg(null)).toBe('null');
  });
});

describe('toUri', () => {
  it('returns a Uri unchanged', () => {
    const u = uri('/x/y.arrows');
    expect(toUri(u)).toBe(u);
  });
  it('unwraps {uri} from sidebar tree items', () => {
    const u = uri('/x.arrows');
    expect(toUri({ uri: u })).toBe(u);
  });
  it('unwraps {resourceUri} from VS Code tab inputs', () => {
    const u = uri('/x.arrows');
    expect(toUri({ resourceUri: u })).toBe(u);
  });
  it('returns undefined for unrecognized shapes', () => {
    expect(toUri(undefined)).toBeUndefined();
    expect(toUri(null)).toBeUndefined();
    expect(toUri({ uri: 'string-not-uri' })).toBeUndefined();
    expect(toUri('/path/as/string')).toBeUndefined();
  });
});

describe('workspaceTargetUri', () => {
  it('uses the first workspace folder when present', () => {
    const folder = uri('/work/project');
    (vscode.workspace as { workspaceFolders: Array<{ uri: vscode.Uri }> }).workspaceFolders = [
      { uri: folder },
    ];
    const target = workspaceTargetUri('graph', 'arrows');
    expect(target.fsPath).toBe(join('/work/project', 'graph.arrows'));
  });
  it('falls back to homedir when no workspace folder is open', () => {
    (vscode.workspace as { workspaceFolders: undefined }).workspaceFolders = undefined;
    const target = workspaceTargetUri('graph', 'arrows');
    expect(target.fsPath.endsWith(join('graph.arrows'))).toBe(true);
    expect(target.fsPath.startsWith('/')).toBe(true);
  });
});

describe('defaultExportUri', () => {
  it('replaces the .arrows extension on saved files', () => {
    const doc = { uri: uri('/work/foo.arrows') } as vscode.TextDocument;
    expect(defaultExportUri(doc, 'svg').fsPath).toBe('/work/foo.svg');
  });
  it('routes untitled docs to the workspace folder', () => {
    const folder = uri('/work/project');
    (vscode.workspace as { workspaceFolders: Array<{ uri: vscode.Uri }> }).workspaceFolders = [
      { uri: folder },
    ];
    const doc = {
      uri: (vscode.Uri as unknown as { parse: (s: string) => vscode.Uri }).parse('untitled:Untitled.arrows'),
    } as vscode.TextDocument;
    expect(defaultExportUri(doc, 'cypher').fsPath).toBe(join('/work/project', 'Untitled.cypher'));
  });
});
