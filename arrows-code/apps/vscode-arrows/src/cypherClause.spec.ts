import { describe, expect, it } from 'vitest';
import { cypherClauseItems } from './cypherClause';

describe('cypherClauseItems - pure picker logic', () => {
  it('returns the three Cypher clauses in canonical order', () => {
    const { items } = cypherClauseItems(undefined);
    expect(items.map((i) => i.clause)).toEqual(['CREATE', 'MATCH', 'MERGE']);
  });

  it('every item carries a non-empty detail string for QuickPick matchOnDetail', () => {
    const { items } = cypherClauseItems(undefined);
    for (const i of items) {
      expect(i.detail.length).toBeGreaterThan(0);
    }
  });

  it('defaults to CREATE when no last value is persisted', () => {
    const { active } = cypherClauseItems(undefined);
    expect(active?.clause).toBe('CREATE');
  });

  it('defaults to CREATE when persisted value is junk (not a valid clause)', () => {
    expect(cypherClauseItems('NOPE').active?.clause).toBe('CREATE');
    expect(cypherClauseItems(42).active?.clause).toBe('CREATE');
    expect(cypherClauseItems(null).active?.clause).toBe('CREATE');
  });

  it('pre-selects the previously chosen clause', () => {
    expect(cypherClauseItems('MATCH').active?.clause).toBe('MATCH');
    expect(cypherClauseItems('MERGE').active?.clause).toBe('MERGE');
    expect(cypherClauseItems('CREATE').active?.clause).toBe('CREATE');
  });

  it('active is always one of items (referential - same object identity)', () => {
    const { items, active } = cypherClauseItems('MERGE');
    expect(items).toContain(active);
  });
});
