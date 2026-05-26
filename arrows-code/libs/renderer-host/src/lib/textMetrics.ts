/**
 * Approximate-but-realistic character widths for sans-serif at 1px font size.
 * Derived from average Helvetica/Arial advance widths. Returned width =
 * sum(char widths) * fontSize. Far more accurate than `text.length * size * 0.55`
 * and good enough to lay out node captions and relationship type labels without
 * needing a native canvas binding.
 */
const W: Record<string, number> = {
  ' ': 0.278, '!': 0.278, '"': 0.355, '#': 0.556, '$': 0.556, '%': 0.889,
  '&': 0.667, "'": 0.191, '(': 0.333, ')': 0.333, '*': 0.389, '+': 0.584,
  ',': 0.278, '-': 0.333, '.': 0.278, '/': 0.278,
  '0': 0.556, '1': 0.556, '2': 0.556, '3': 0.556, '4': 0.556, '5': 0.556,
  '6': 0.556, '7': 0.556, '8': 0.556, '9': 0.556,
  ':': 0.278, ';': 0.278, '<': 0.584, '=': 0.584, '>': 0.584, '?': 0.556, '@': 1.015,
  A: 0.667, B: 0.667, C: 0.722, D: 0.722, E: 0.667, F: 0.611, G: 0.778, H: 0.722,
  I: 0.278, J: 0.5, K: 0.667, L: 0.556, M: 0.833, N: 0.722, O: 0.778, P: 0.667,
  Q: 0.778, R: 0.722, S: 0.667, T: 0.611, U: 0.722, V: 0.667, W: 0.944, X: 0.667,
  Y: 0.667, Z: 0.611,
  '[': 0.278, '\\': 0.278, ']': 0.278, '^': 0.469, _: 0.556, '`': 0.333,
  a: 0.556, b: 0.556, c: 0.5, d: 0.556, e: 0.556, f: 0.278, g: 0.556, h: 0.556,
  i: 0.222, j: 0.222, k: 0.5, l: 0.222, m: 0.833, n: 0.556, o: 0.556, p: 0.556,
  q: 0.556, r: 0.333, s: 0.5, t: 0.278, u: 0.556, v: 0.5, w: 0.722, x: 0.5,
  y: 0.5, z: 0.5,
  '{': 0.334, '|': 0.26, '}': 0.334, '~': 0.584,
};

const DEFAULT_WIDTH = 0.55;
const BOLD_FACTOR = 1.05;

export function measureTextWidth(text: string, fontSize: number, fontWeight: string): number {
  const factor = /bold|[67-9]00/i.test(fontWeight) ? BOLD_FACTOR : 1;
  let units = 0;
  for (const ch of text) {
    units += W[ch] ?? DEFAULT_WIDTH;
  }
  return units * fontSize * factor;
}
