import {nextAvailableId} from "./Id";
it('suggests n0 when there are no nodes supplied', () => {
  const id = nextAvailableId([])
  expect(id).toEqual('n0')
})

it('suggests n0 when all other ids are in a different format', () => {
  const id = nextAvailableId([
    { id: 'some_other_kind_of_id-0'}
  ])
  expect(id).toEqual('n0')
})

it('suggests next available id when other ids are of mixed formats', () => {
  const id = nextAvailableId([
    { id: 'some_other_kind_of_id-0'},
    { id: 'n1'},
    { id: 'n2n'}
  ])
  expect(id).toEqual('n2')
})

it('suggests n2 when n0 and n1 are taken', () => {
  const id = nextAvailableId([
    { id: 'n0'},
    { id: 'n1'}
  ])
  expect(id).toEqual('n2')
})

it('suggests n2 when n1 is taken', () => {
  const id = nextAvailableId([
    { id: 'n1'}
  ])
  expect(id).toEqual('n2')
})

it('suggests n10 when n9 is taken', () => {
  const id = nextAvailableId([
    { id: 'n9'}
  ])
  expect(id).toEqual('n10')
})

it('suggests n11 when n10 is taken', () => {
  const id = nextAvailableId([
    { id: 'n10'}
  ])
  expect(id).toEqual('n11')
})

