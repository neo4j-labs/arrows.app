// Parses an arrows.app share URL or raw .arrows JSON to a JSON payload, or null.

function decodeArrowsAppImportUrl(input: string): string | null {
  const m = /[#/]?\/?import\/json=([^&\s]+)/.exec(input);
  if (!m) return null;
  try {
    return Buffer.from(decodeURIComponent(m[1]), 'base64').toString('utf8');
  } catch {
    return null;
  }
}

export function parseImportInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || /import\/json=/.test(trimmed)) {
    return decodeArrowsAppImportUrl(trimmed);
  }
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.nodes)) {
        return trimmed;
      }
    } catch {
      /* fall through */
    }
  }
  return null;
}
