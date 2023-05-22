import {commonValue} from "./values";

it('returns common value when all values are equal', () => {
  const value = commonValue([23, 23, 23])
  expect(value).toEqual(23)
})

it('returns undefined for when values differ', () => {
  const value = commonValue([1, 1, 2])
  expect(value).toBeUndefined()
})

it('returns undefined for when some values are null', () => {
  const value = commonValue([1, null, 1])
  expect(value).toBeUndefined()
})

it('returns undefined for when some values are undefined', () => {
  const value = commonValue([1, null, 1])
  expect(value).toBeUndefined()
})

it('returns undefined for empty array', () => {
  const value = commonValue([])
  expect(value).toBeUndefined()
})

