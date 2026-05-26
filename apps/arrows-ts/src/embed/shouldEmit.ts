import { isUserBusy } from './userBusy';

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

export function shouldEmit(input: ShouldEmitInput): ShouldEmitOutput {
  // Single source of truth for "user is mid-interaction" — adding a new transient
  // state should mean editing isUserBusy in one place, not two.
  if (isUserBusy(input.state, !!input.isTyping)) {
    return { emit: false, serialized: input.lastSerialized };
  }
  const state = input.state as { graph?: unknown };
  const graph = getPresentGraph(state.graph);
  const serialized = JSON.stringify(graph);
  if (serialized === input.lastSerialized) return { emit: false, serialized };
  return { emit: true, serialized, graph };
}

function getPresentGraph(slice: unknown): unknown {
  const wrapped = slice as { present?: unknown };
  return wrapped && typeof wrapped === 'object' && 'present' in wrapped ? wrapped.present : slice;
}
