export const numbersOnly = (value: string) => {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"); // keeps first dot only
};
