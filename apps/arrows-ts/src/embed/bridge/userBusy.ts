// Shared by outbound emit gate and inbound load deferral. Adding a new
// transient state slice means editing this one place; otherwise the two
// sides diverge and the canvas snaps back mid-interaction.
export function isUserBusy(state: unknown, isInputFocused: boolean): boolean {
  const s = state as { mouse?: { dragType?: string | null }; selection?: { editing?: unknown } };
  const dragType = s.mouse?.dragType;
  if (dragType && dragType !== 'NONE') return true;
  if (s.selection?.editing) return true;
  if (isInputFocused) return true;
  return false;
}
