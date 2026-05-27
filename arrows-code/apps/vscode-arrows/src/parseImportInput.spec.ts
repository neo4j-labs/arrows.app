import { describe, expect, it } from 'vitest';
import { parseImportInput } from './parseImportInput';

const aliceBobJson = JSON.stringify({
  nodes: [
    {
      id: 'n0',
      position: { x: 0, y: 0 },
      caption: 'A',
      labels: [],
      properties: {},
      style: {},
    },
  ],
  relationships: [],
  style: {},
});

describe('parseImportInput', () => {
  it('returns null on empty input', () => {
    expect(parseImportInput('')).toBeNull();
    expect(parseImportInput('   ')).toBeNull();
  });

  it('decodes a full arrows.app share URL with #/import/json= fragment', () => {
    const b64 = Buffer.from(aliceBobJson, 'utf8').toString('base64');
    const url = `https://arrows.app/#/import/json=${encodeURIComponent(b64)}`;
    expect(parseImportInput(url)).toBe(aliceBobJson);
  });

  it('decodes a bare hash fragment (user copied just the fragment)', () => {
    const b64 = Buffer.from(aliceBobJson, 'utf8').toString('base64');
    expect(parseImportInput(`#/import/json=${encodeURIComponent(b64)}`)).toBe(
      aliceBobJson
    );
  });

  it('accepts raw .arrows JSON pasted in', () => {
    expect(parseImportInput(aliceBobJson)).toBe(aliceBobJson);
  });

  it('rejects raw text that is not JSON', () => {
    expect(parseImportInput('hello world')).toBeNull();
    expect(parseImportInput('{ not json')).toBeNull();
  });

  it('rejects JSON without a nodes array', () => {
    expect(parseImportInput('{"foo":1}')).toBeNull();
    expect(parseImportInput('[]')).toBeNull();
    expect(parseImportInput('null')).toBeNull();
  });

  it('rejects an arrows.app URL with no import/json hash', () => {
    expect(parseImportInput('https://arrows.app/#/local/id=abc')).toBeNull();
  });

  it('round-trips an export URL (symmetric flow)', () => {
    const b64 = Buffer.from(aliceBobJson, 'utf8').toString('base64');
    const url = `https://arrows.app/#/import/json=${encodeURIComponent(b64)}`;
    expect(parseImportInput(url)).toBe(aliceBobJson);
  });
});
