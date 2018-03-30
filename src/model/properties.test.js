import {combineProperties} from "./properties";

it('combines properties from different entities', () => {
  const entities = [
    {properties: {a: 'a', b: 'b', c: 'c1'}},
    {properties: {b: 'b', c: 'c2'}}
  ]
  expect(combineProperties(entities)).toEqual({
    a: {status: 'PARTIAL'},
    b: {status: 'CONSISTENT', value: 'b'},
    c: {status: 'INCONSISTENT'}
  })
})