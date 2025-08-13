export const numbersOnly = (value: string) => {
  return value.replace(/[^0-9]/g, ""); // Removes everything except numbers
};
