import { distribute, obstacleSeparation } from './circumferentialDistribution';

it('finds angles to obstacles', () => {
  const angle = Math.PI / 2;
  const obstacles = [{ angle: Math.PI / 4 }, { angle: (7 * Math.PI) / 4 }];
  expect(obstacleSeparation(angle, obstacles)).toEqual(Math.PI / 4);
});

it('considers wrapping', () => {
  const angle = Math.PI / 2;
  const obstacles = [{ angle: (7 * Math.PI) / 4 }];
  expect(obstacleSeparation(angle, obstacles)).toEqual((3 * Math.PI) / 4);
});

it('considers wrapping properly', () => {
  const angle = Math.PI;
  const obstacles = [{ angle: 0 }];
  expect(obstacleSeparation(angle, obstacles)).toEqual(Math.PI);
});

it('really considers wrapping properly', () => {
  const angle = (7 * Math.PI) / 4;
  const obstacles = [{ angle: 0 }];
  expect(obstacleSeparation(angle, obstacles)).toEqual(Math.PI / 4);
});

it('places an item at its preferred angle when there are no obstacles', () => {
  const preferredAngles = [
    Math.PI / 4,
    (3 * Math.PI) / 4,
    (5 * Math.PI) / 4,
    (7 * Math.PI) / 4,
  ];
  const obstacles = [];
  expect(distribute(preferredAngles, obstacles)).toEqual(Math.PI / 4);
});

it('places an item at next preferred angle if first preference is blocked', () => {
  const preferredAngles = [
    Math.PI / 4,
    (3 * Math.PI) / 4,
    (5 * Math.PI) / 4,
    (7 * Math.PI) / 4,
  ];
  const obstacles = [{ angle: Math.PI / 4 }];
  expect(distribute(preferredAngles, obstacles)).toEqual((5 * Math.PI) / 4);
});
