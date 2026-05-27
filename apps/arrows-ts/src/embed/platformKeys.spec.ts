import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shortcut } from './platformKeys';

// shortcut() inspects navigator.platform / navigator.userAgent at call time.
// Stub both for deterministic tests.
function stubPlatform(mac: boolean): void {
  const platform = mac ? 'MacIntel' : 'Win32';
  const userAgent = mac
    ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
  vi.stubGlobal('navigator', { platform, userAgent });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('shortcut() — macOS vocabulary', () => {
  beforeEach(() => stubPlatform(true));

  it('cmd → ⌘', () => {
    expect(shortcut({ mod: 'cmd', key: 'Z' })).toBe('⌘Z');
  });

  it('cmd+shift → ⇧⌘', () => {
    expect(shortcut({ mod: 'cmd+shift', key: 'Z' })).toBe('⇧⌘Z');
  });

  it('cmd+alt → ⌥⌘', () => {
    expect(shortcut({ mod: 'cmd+alt', key: 'A' })).toBe('⌥⌘A');
  });

  it('shift+alt → ⇧⌥', () => {
    expect(shortcut({ mod: 'shift+alt', key: 'F' })).toBe('⇧⌥F');
  });

  it('shift alone → ⇧', () => {
    expect(shortcut({ mod: 'shift', key: '←' })).toBe('⇧←');
  });

  it('no modifier → just the key', () => {
    expect(shortcut({ key: 'V' })).toBe('V');
  });
});

describe('shortcut() — Windows/Linux vocabulary', () => {
  beforeEach(() => stubPlatform(false));

  it('cmd → Ctrl+', () => {
    expect(shortcut({ mod: 'cmd', key: 'Z' })).toBe('Ctrl+Z');
  });

  it('cmd+shift → Ctrl+Shift+', () => {
    expect(shortcut({ mod: 'cmd+shift', key: 'Z' })).toBe('Ctrl+Shift+Z');
  });

  it('cmd+alt → Ctrl+Alt+', () => {
    expect(shortcut({ mod: 'cmd+alt', key: 'A' })).toBe('Ctrl+Alt+A');
  });

  it('shift+alt → Shift+Alt+', () => {
    expect(shortcut({ mod: 'shift+alt', key: 'F' })).toBe('Shift+Alt+F');
  });

  it('shift alone → Shift+', () => {
    expect(shortcut({ mod: 'shift', key: '←' })).toBe('Shift+←');
  });

  it('no modifier → just the key', () => {
    expect(shortcut({ key: 'V' })).toBe('V');
  });
});

describe('shortcut() — falls back gracefully', () => {
  it('treats unknown navigator as non-Mac', () => {
    vi.stubGlobal('navigator', { platform: '', userAgent: '' });
    expect(shortcut({ mod: 'cmd', key: 'Z' })).toBe('Ctrl+Z');
  });

  it('detects Mac from userAgent when platform string lies', () => {
    vi.stubGlobal('navigator', {
      platform: 'unknown',
      userAgent: 'Mozilla/5.0 (Macintosh; …)',
    });
    expect(shortcut({ mod: 'cmd', key: 'Z' })).toBe('⌘Z');
  });
});
