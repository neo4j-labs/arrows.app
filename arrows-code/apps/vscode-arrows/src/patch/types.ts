import type { Graph } from '@neo4j-arrows/model';

export type PatchOp =
  | { type: 'addNode'; id: string; x: number; y: number; caption?: string; labels?: string[]; properties?: Record<string, string>; style?: Record<string, string> }
  | { type: 'removeNode'; id: string }
  | { type: 'movePos'; id: string; dx: number; dy: number }
  | { type: 'setPos'; id: string; x: number; y: number }
  | { type: 'setCaption'; id: string; caption: string }
  | { type: 'addLabel'; id: string; label: string }
  | { type: 'removeLabel'; id: string; label: string }
  | { type: 'renameLabel'; oldLabel: string; newLabel: string }
  | { type: 'setProperty'; id: string; key: string; value: string }
  | { type: 'removeProperty'; id: string; key: string }
  | { type: 'setStyle'; id: string | null; key: string; value: string }
  | { type: 'addRelationship'; id: string; fromId: string; toId: string; relType: string; properties?: Record<string, string>; style?: Record<string, string> }
  | { type: 'removeRelationship'; id: string }
  | { type: 'setRelType'; id: string; relType: string }
  | { type: 'renameRelType'; oldType: string; newType: string };

export interface PatchError {
  op: PatchOp;
  code: string;
  message: string;
}

export interface PatchResult {
  graph: Graph;
  errors: PatchError[];
}
