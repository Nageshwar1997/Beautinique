// `numerator / denominator` as a whole number, to the nearest, and a half goes up ("aadha paisa
// upar", docs/ARCHITECTURE.md §1.8). BigInt, so the division is exact and no float is ever made.
// The numerator is not negative and the denominator is more than zero: every caller has checked.
export function roundedDivision(numerator: bigint, denominator: bigint): bigint {
  return (2n * numerator + denominator) / (2n * denominator);
}
