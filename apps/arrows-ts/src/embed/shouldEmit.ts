import { isUserBusy } from './userBusy';
// @ts-expect-error JS module without local typings.
import { getPresentGraph } from '../selectors';

export interface ShouldEmitInput {
  state: unknown;
  lastSerialized: string;
  isTyping?: boolean;
}

export interface ShouldEmitOutput {
  emit: boolean;
  serialized: string;
  graph?: unknown;
}

export function presentGraphFromState(state: unknown): unknown {
  return getPresentGraph(state);
}

export function shouldEmit(input: ShouldEmitInput): ShouldEmitOutput {
  if (isUserBusy(input.state, !!input.isTyping)) {
    return { emit: false, serialized: input.lastSerialized };
  }
  const graph = presentGraphFromState(input.state);
  const serialized = JSON.stringify(graph);
  if (serialized === input.lastSerialized) return { emit: false, serialized };
  return { emit: true, serialized, graph };
}
