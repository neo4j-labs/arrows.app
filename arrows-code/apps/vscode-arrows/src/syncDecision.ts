export interface ApplyDecisionInput {
  currentText: string;
  nextText: string;
}

export type ApplyDecision =
  | { action: 'apply' }
  | { action: 'skip'; reason: 'noop' };

// Echo suppression + concurrency are handled in the bridge (emit history) and
// PreviewProvider (serialized applies) respectively. Here we just decide:
// is the text actually changing?
export function decideApply(input: ApplyDecisionInput): ApplyDecision {
  if (input.currentText === input.nextText)
    return { action: 'skip', reason: 'noop' };
  return { action: 'apply' };
}
