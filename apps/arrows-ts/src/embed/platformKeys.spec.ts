import { afterEach, describe, expect, it, vi } from 'vitest';
import { shortcut } from './platformKeys';

const stubPlatform = (mac: boolean): void => {
  vi.stubGlobal('navigator', {
    platform: mac ? 'MacIntel' : 'Win32',
    userAgent: mac
      ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });
};

afterEach(() => vi.unstubAllGlobals());

describe('shortcut() — platform-aware modifier formatting', () => {
  const cases: Array<[Parameters<typeof shortcut>[0], string, string]> = [
    // [input, mac, win/linux]
    [{ mod: 'cmd', key: 'Z' }, '⌘Z', 'Ctrl+Z'],
    [{ mod: 'cmd+shift', key: 'Z' }, '⇧⌘Z', 'Ctrl+Shift+Z'],
    [{ mod: 'cmd+alt', key: 'A' }, '⌥⌘A', 'Ctrl+Alt+A'],
    [{ mod: 'shift+alt', key: 'F' }, '⇧⌥F', 'Shift+Alt+F'],
    [{ mod: 'shift', key: '←' }, '⇧←', 'Shift+←'],
    [{ key: 'V' }, 'V', 'V'], // no modifier
  ];

  it.each(cases)('macOS: %j → %s', (input, mac) => {
    stubPlatform(true);
    expect(shortcut(input)).toBe(mac);
  });

  it.each(cases)('Windows/Linux: %j → %s', (input, _mac, other) => {
    stubPlatform(false);
    expect(shortcut(input)).toBe(other);
  });

  it('falls back to non-Mac when navigator is empty', () => {
    vi.stubGlobal('navigator', { platform: '', userAgent: '' });
    expect(shortcut({ mod: 'cmd', key: 'Z' })).toBe('Ctrl+Z');
  });

  it('detects Mac from userAgent when navigator.platform lies', () => {
    vi.stubGlobal('navigator', { platform: 'unknown', userAgent: 'Mozilla/5.0 (Macintosh; …)' });
    expect(shortcut({ mod: 'cmd', key: 'Z' })).toBe('⌘Z');
  });
});
