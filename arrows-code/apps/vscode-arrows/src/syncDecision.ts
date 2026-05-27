export interface ApplyDecisionInput {
  currentText: string;
  nextText: string;
}

export type ApplyDecision =
  | { action: 'apply' }
  | { action: 'skip'; reason: 'noop' };

export function decideApply(input: ApplyDecisionInput): ApplyDecision {
  if (input.currentText === input.nextText)
    return { action: 'skip', reason: 'noop' };
  return { action: 'apply' };
}
