import { formatAmount } from "../src/helpers/StringHelper";

// Test case for a whole number
test("formatAmount for whole number", () => {
  const result = formatAmount("123");
  expect(result).toBe("123");
});

// Test case for a decimal with more than 5 decimal places
test("formatAmount for more than 5 decimal places", () => {
  const result = formatAmount("456.123456789");
  expect(result).toBe("456.12345");
});

// Test case for a decimal with exactly 5 decimal places
test("formatAmount for exactly 5 decimal places", () => {
  const result = formatAmount("789.12345");
  expect(result).toBe("789.12345");
});

// Test case for a decimal with less than 5 decimal places
test("formatAmount for less than 5 decimal places", () => {
  const result = formatAmount("987.987");
  expect(result).toBe("987.987");
});

// Test case for a string without a decimal point
test("formatAmount for a string without a decimal point", () => {
  const result = formatAmount("1000");
  expect(result).toBe("1000");
});
