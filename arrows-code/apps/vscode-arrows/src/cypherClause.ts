export type CypherClause = 'CREATE' | 'MATCH' | 'MERGE';

export const LAST_CYPHER_CLAUSE_KEY = 'arrows.lastCypherClause';

export interface CypherClauseItem {
  label: string;
  clause: CypherClause;
  detail: string;
}

export function cypherClauseItems(last: unknown): {
  items: CypherClauseItem[];
  active: CypherClauseItem | undefined;
} {
  const items: CypherClauseItem[] = [
    { label: 'CREATE', clause: 'CREATE', detail: 'Insert nodes and relationships' },
    { label: 'MATCH',  clause: 'MATCH',  detail: 'Read pattern for query authoring' },
    { label: 'MERGE',  clause: 'MERGE',  detail: 'Upsert - match-or-create on the key' },
  ];
  const lastClause: CypherClause =
    last === 'CREATE' || last === 'MATCH' || last === 'MERGE' ? last : 'CREATE';
  const active = items.find((i) => i.clause === lastClause);
  return { items, active };
}
