import snakeToCamelCase from "./snakeToCamelCase";

describe("snakeToCamelCase utility function", () => {
  const cases = [
    ["input", "input"],
    ["INPUT", "input"],
    ["input_string", "inputString"],
    ["INPUT_STRING", "inputString"],
    ["INPUT____STRING", "inputString"],
    ["_INPUT____STRING", "inputString"],
    ["::::::a", "a"],
  ];
  test.each(cases)(`formats %s to %s`, (input, output) =>
    expect(snakeToCamelCase(input)).toEqual(output)
  );
});
