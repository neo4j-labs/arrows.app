// Render keyboard shortcut labels in the user's platform vocabulary.
// On Mac: Cmd → ⌘, Shift → ⇧, Alt → ⌥, Ctrl → ⌃.
// On Windows/Linux: write the words out.

const isMacPlatform = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  // navigator.platform is deprecated but still the most reliable single check.
  // userAgentData is gated behind permissions; fall back to userAgent string.
  const platform = (navigator as { platform?: string }).platform ?? '';
  return /Mac/i.test(platform) || /Mac/i.test(navigator.userAgent ?? '');
};

interface Chord { mod?: 'cmd' | 'cmd+shift' | 'shift+alt'; key: string }

export function shortcut(c: Chord): string {
  const mac = isMacPlatform();
  switch (c.mod) {
    case 'cmd':       return mac ? `⌘${c.key}` : `Ctrl+${c.key}`;
    case 'cmd+shift': return mac ? `⇧⌘${c.key}` : `Ctrl+Shift+${c.key}`;
    case 'shift+alt': return mac ? `⇧⌥${c.key}` : `Shift+Alt+${c.key}`;
    default:          return c.key;
  }
}
