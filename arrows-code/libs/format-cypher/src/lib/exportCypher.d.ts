import type { Graph } from '@neo4j-arrows/model';

export declare function exportCypher(
  graph: Graph,
  keyword: 'CREATE' | 'MERGE' | 'MATCH',
  options?: { includeStyling?: boolean }
): string;
