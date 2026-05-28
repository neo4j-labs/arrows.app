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
  if (isUserBusy(input.state, !!input.isTyping)) {
    return { emit: false, serialized: input.lastSerialized };
  }
  const state = input.state as { graph?: unknown };
  const graph = getPresentGraph(state.graph);
  const serialized = JSON.stringify(graph);
  if (serialized === input.lastSerialized) return { emit: false, serialized };
  return { emit: true, serialized, graph };
}

export function getPresentGraph(slice: unknown): unknown {
  const wrapped = slice as { present?: unknown };
  return wrapped && typeof wrapped === 'object' && 'present' in wrapped ? wrapped.present : slice;
}

// Convenience: navigate from a top-level redux state to the present graph.
export function presentGraphFromState(state: unknown): unknown {
  const s = state as { graph?: unknown };
  return getPresentGraph(s.graph);
}
