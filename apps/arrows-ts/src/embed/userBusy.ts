// Shared predicate: is the user mid-interaction?
//
// Both sides of the bridge consult this:
//  - Outbound (shouldEmit) — don't ship intermediate states to the host.
//  - Inbound (bridge.tryApplyPending) — don't clobber an in-flight gesture.
//
// Adding a new transient state slice (e.g. a "connecting" mode in dragToCreate,
// or marquee-in-progress) means editing this one function — if it diverges
// between the two paths, the user will see canvas snap-back mid-interaction
// that looks like an echo bug but is really a missing predicate term.

export function isUserBusy(state: unknown, isInputFocused: boolean): boolean {
  const s = state as { mouse?: { dragType?: string | null }; selection?: { editing?: unknown } };
  // 'NONE' is arrows-ts's mouse reducer's idle sentinel, not null.
  const dragType = s.mouse?.dragType;
  if (dragType && dragType !== 'NONE') return true;
  if (s.selection?.editing) return true;
  if (isInputFocused) return true;
  return false;
}
