import {bisect} from "./bisect";

it('bisects', () => {
  const f = (x) => {
    return x < 2 / 3
  }
  expect(bisect(f, 1, 0)).toBeCloseTo(2 / 3)
})