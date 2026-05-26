export * from './lib/VisualGraph';
export * from './lib/VisualNode';
export * from './lib/VisualRelationship';
export * from './lib/VisualAttachment';
export * from './lib/VisualGang';
export * from './lib/VisualGuides';

// Headless SVG rendering — used by arrows-code subsystem.
// See arrows-code/docs/decoupling.md for the audit memo.
export { renderSvgDom, renderSvgEncapsulated } from './lib/utils/offScreenSvgRenderer';

