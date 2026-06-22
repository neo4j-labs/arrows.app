export type Severity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  severity: Severity;
  code: string;
  message: string;
  anchor?: { kind: 'node' | 'relationship' | 'graph' | 'property' | 'style'; id?: string; key?: string };
}

export const CODES = {
  refIntegrity: 'structural.ref-integrity',
  duplicateId: 'structural.duplicate-id',
  emptyRequired: 'structural.empty-required-field',
  styleKeyUnknown: 'structural.style-key-unknown',
  styleValueInvalid: 'structural.style-value-invalid',
} as const;
