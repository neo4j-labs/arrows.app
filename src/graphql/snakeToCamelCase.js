import snakeToPascalCase from "./snakeToPascalCase";

export default function snakeToCamelCase(str = "") {
  const pascalCased = snakeToPascalCase(str);
  if (!pascalCased) {
    return pascalCased;
  }
  return pascalCased[0].toLowerCase() + pascalCased.slice(1);
}
