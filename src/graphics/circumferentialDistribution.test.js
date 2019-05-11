import {distribute, obstacleSeparation} from "./circumferentialDistribution"

it('finds angles to obstacles', () => {
  const angle = Math.PI / 2
  const obstacles = [
    {angle: Math.PI / 4},
    {angle: 7 * Math.PI / 4}
  ]
  expect(obstacleSeparation(angle, obstacles)).toEqual(Math.PI / 4)
})

it('considers wrapping', () => {
  const angle = Math.PI / 2
  const obstacles = [
    {angle: 7 * Math.PI / 4}
  ]
  expect(obstacleSeparation(angle, obstacles)).toEqual(3 * Math.PI / 4)
})

it('places an item at its preferred angle when there are no obstacles', () => {
  const items = [
    {preferredAngles: [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4], payload: 'labels'}
  ]
  const obstacles = [
  ]
  expect(distribute(items, obstacles)).toEqual([
    {angle: Math.PI / 4, payload: 'labels'}
  ])
})

it('places an item at next preferred angle if first preference is blocked', () => {
  const items = [
    {preferredAngles: [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4], payload: 'labels'}
  ]
  const obstacles = [
    {angle: Math.PI / 4}
  ]
  expect(distribute(items, obstacles)).toEqual([
    {angle: 7 * Math.PI / 4, payload: 'labels'}
  ])
})

it('resolves conflicts between preferred angles', () => {
  const items = [
    {preferredAngles: [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4], payload: 'labels'},
    {preferredAngles: [Math.PI / 2, 3 * Math.PI / 2, 0, Math.PI], payload: 'properties'},
    {preferredAngles: [Math.PI / 2, 3 * Math.PI / 2, 0, Math.PI], payload: 'caption'}
  ]
  const obstacles = [
  ]
  expect(distribute(items, obstacles)).toEqual([
    {angle: Math.PI / 4, payload: 'labels'},
    {angle: 3 * Math.PI / 2, payload: 'properties'},
    {angle: Math.PI, payload: 'caption'}
  ])
})
