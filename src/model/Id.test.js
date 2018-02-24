import {nextAvailableId} from "./Id";
it('suggests n0 when there are no nodes supplied', () => {
  const id = nextAvailableId([])
  expect(id).toEqual('n0')
})

it('suggest n0 when all other ids are in a different format', () => {
  const id = nextAvailableId([
    { id: 'some_other_kind_of_id-0'}
  ])
  expect(id).toEqual('n0')
})

it('suggest n2 when n0 and n1 are taken', () => {
  const id = nextAvailableId([
    { id: 'n0'},
    { id: 'n1'}
  ])
  expect(id).toEqual('n2')
})

it('suggest n2 when n1 is taken', () => {
  const id = nextAvailableId([
    { id: 'n1'}
  ])
  expect(id).toEqual('n2')
})

