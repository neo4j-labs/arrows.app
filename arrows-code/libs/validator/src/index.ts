export { checkStructural } from './lib/structural';
export { CODES } from './lib/types';
export type { Diagnostic, Severity } from './lib/types';

import type { Graph } from '@neo4j-arrows/model';
import { checkStructural } from './lib/structural';
import type { Diagnostic } from './lib/types';

/**
 * Top-level entrypoint. Runs every available rule layer. v1 ships structural;
 * future layers (naming, propertyTypes, placement, color, parameters, cypherSanity)
 * compose here without breaking the API.
 */
export function validate(graph: Graph): Diagnostic[] {
  return checkStructural(graph);
}
