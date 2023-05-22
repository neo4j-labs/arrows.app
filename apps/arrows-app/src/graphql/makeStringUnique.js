export default function makeStringUnique(pool, str) {
  let counter = "";
  while (pool.includes(str + counter.toString())) {
    counter = Number(counter) + 1;
  }
  return str + counter.toString();
}
