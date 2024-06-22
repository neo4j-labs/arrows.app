import { fitTextToCircle } from './circleWordWrap';

const fixed = (s: string) => {
  return s.length;
};

it('keeps everything on one line if there is enough space', () => {
  expect(fitTextToCircle('caption', 4, fixed, 1)).toEqual(['caption']);
  expect(fitTextToCircle('two words', 5, fixed, 1)).toEqual(['two words']);
});

it('splits on space', () => {
  expect(fitTextToCircle('two words', 4, fixed, 1)).toEqual(['two', 'words']);
});
