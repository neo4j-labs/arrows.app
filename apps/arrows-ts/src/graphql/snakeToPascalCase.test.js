import snakeToPascalCase from './snakeToPascalCase';

describe('snakeToPascalCase utility function', () => {
  const cases = [
    ['input', 'Input'],
    ['INPUT', 'Input'],
    ['input_string', 'InputString'],
    ['INPUT_STRING', 'InputString'],
    ['INPUT____STRING', 'InputString'],
    ['_INPUT____STRING', 'InputString'],
    ['::::::a', 'A'],
  ];
  test.each(cases)(`formats %s to %s`, (input, output) =>
    expect(snakeToPascalCase(input)).toEqual(output)
  );
});
