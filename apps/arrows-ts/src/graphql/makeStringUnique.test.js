import makeStringUnique from "./makeStringUnique";

describe("makeStringUnique utility function", () => {
  const cases = [
    [["name", "name1", "else"], "name", "name2"],
    [["name", "name2", "else"], "name", "name1"],
    [["else"], "name", "name"],
    [[], "name", "name"],
  ];
  test.each(cases)(`formats %s to %s`, (pool, input, output) =>
    expect(makeStringUnique(pool, input)).toEqual(output)
  );
});
