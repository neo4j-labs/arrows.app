import { describe, expect, it } from 'vitest';
import { decideApply } from './syncDecision';

describe('decideApply — webview → host write decision', () => {
  it('applies when text differs', () => {
    expect(decideApply({ currentText: 'old', nextText: 'new' })).toEqual({ action: 'apply' });
  });

  it('drops when nextText === currentText (no-op)', () => {
    expect(decideApply({ currentText: 'same', nextText: 'same' })).toEqual({ action: 'skip', reason: 'noop' });
  });

  it('rapid second edit still applies — no docVersion or in-flight check drops it', () => {
    // The pre-fix code dropped this scenario, stranding the second edit and
    // creating the "rapid-action reverses" bug. New contract: always apply if
    // the text differs. Echo suppression lives in the bridge, not here.
    expect(decideApply({ currentText: 'A', nextText: 'AB' })).toEqual({ action: 'apply' });
  });
});
