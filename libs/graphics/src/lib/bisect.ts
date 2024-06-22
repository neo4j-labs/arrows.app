export const bisect = (
  f: (n: number) => boolean,
  start: number,
  minimum: number
) => {
  if (f(start)) return start;

  let above = start;
  let below = minimum;
  let result = false;
  while ((above - below) / below > 1e-2) {
    const x = below + (above - below) / 2;
    result = f(x);
    if (result) {
      below = x;
    } else {
      above = x;
    }
  }
  if (!result) {
    f(below);
  }
  return below;
};
