export const commonValue = (array: any[]) => {
  return array.reduce((values, value) => {
    if (values.length === 0) {
      return [value];
    } else if (values[0] === value) {
      return values;
    } else {
      return [undefined];
    }
  }, [])[0];
};
