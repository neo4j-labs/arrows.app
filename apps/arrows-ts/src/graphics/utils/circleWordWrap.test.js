import { splitIntoLines } from './circleWordWrap';

const fixed = (string) => {
  return string.length;
};

it('keeps everything on one line if there is enough space', () => {
  expect(splitIntoLines('caption', 4, fixed, 1)).toEqual(['caption']);
  expect(splitIntoLines('two words', 5, fixed, 1)).toEqual(['two words']);
});

it('splits on space', () => {
  expect(splitIntoLines('two words', 4, fixed, 1)).toEqual(['two', 'words']);
});
