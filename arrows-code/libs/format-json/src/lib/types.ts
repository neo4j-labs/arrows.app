import type { Graph } from '@neo4j-arrows/model';

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface ReadDiagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  path?: string;
}

export interface ReadResult {
  graph: Graph;
  diagnostics: ReadDiagnostic[];
}
