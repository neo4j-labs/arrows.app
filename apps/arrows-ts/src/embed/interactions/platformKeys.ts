// Render keyboard shortcut labels in the user's platform vocabulary.
// On Mac: Cmd → ⌘, Shift → ⇧, Alt → ⌥, Ctrl → ⌃.
// On Windows/Linux: write the words out.

const isMacPlatform = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const platform = (navigator as { platform?: string }).platform ?? '';
  return /Mac/i.test(platform) || /Mac/i.test(navigator.userAgent ?? '');
};

interface Chord { mod?: 'cmd' | 'cmd+shift' | 'cmd+alt' | 'shift+alt' | 'shift'; key: string }

export function shortcut(c: Chord): string {
  const mac = isMacPlatform();
  switch (c.mod) {
    case 'cmd':       return mac ? `⌘${c.key}` : `Ctrl+${c.key}`;
    case 'cmd+shift': return mac ? `⇧⌘${c.key}` : `Ctrl+Shift+${c.key}`;
    case 'cmd+alt':   return mac ? `⌥⌘${c.key}` : `Ctrl+Alt+${c.key}`;
    case 'shift+alt': return mac ? `⇧⌥${c.key}` : `Shift+Alt+${c.key}`;
    case 'shift':     return mac ? `⇧${c.key}` : `Shift+${c.key}`;
    default:          return c.key;
  }
}
