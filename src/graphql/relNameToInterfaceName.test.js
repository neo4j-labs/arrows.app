import relNameToInterfaceName from "./relNameToInterfaceName"

describe('relNameToInterfaceName utility function', () => {
  const cases = [
    ['input', 'Input'],
    ['INPUT', 'Input'],
    ['input_string', 'InputString'],
    ['INPUT_STRING', 'InputString'],
    ['INPUT____STRING', 'InputString'],
    ['_INPUT____STRING', 'InputString'],
    ['::::::a', 'A'],
  ]
  test.each(cases)(
    `formats %s to %s`, 
    (input, output) => expect(relNameToInterfaceName(input)).toEqual(output)
  )
})
