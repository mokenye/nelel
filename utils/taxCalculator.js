/**
 * Estimates Net Annual Income based on 2025 US Tax Rules
 * @param {number} grossIncome - Total annual salary
 * @param {string} state - Two-letter state code (e.g., 'NY', 'TX')
 * @returns {object} Breakdown of taxes and net pay
 */

// State income tax rates (2025)
// - No-tax states: 0%
// - Flat-rate states: exact statutory rate
// - Progressive states: estimated effective rate at ~$75k gross income
//   Effective rate varies with income — higher earners in CA, NY, OR will
//   be meaningfully above the rates listed here
// - Does not include local income taxes (e.g. NYC adds ~3.9% on top of NY state)
const STATE_TAX_RATES = {
  // No income tax
  AK: 0,
  FL: 0,
  NV: 0,
  NH: 0,   // repealed interest/dividends tax effective 2025
  SD: 0,
  TN: 0,
  TX: 0,
  WA: 0,
  WY: 0,

  // Flat rate states (exact 2025 rates)
  AZ: 0.025,   // flat 2.5%
  CO: 0.044,
  IL: 0.0495,
  IN: 0.030,   // reduced to 3.0% in 2025
  IA: 0.038,   // flat 3.8% in 2025
  KY: 0.040,
  LA: 0.030,   // flat 3% in 2025
  MA: 0.050,
  MI: 0.0425,
  MS: 0.044,   // reduced to 4.4% flat in 2025
  NC: 0.0425,  // reduced to 4.25% in 2025
  PA: 0.0307,
  UT: 0.045,   // reduced to 4.5% in 2025

  // Progressive states — estimated effective rates at ~$75k gross
  AL: 0.040,
  AR: 0.042,
  CA: 0.072,
  CT: 0.055,
  DE: 0.052,
  GA: 0.054,
  HI: 0.075,
  ID: 0.053,
  KS: 0.048,
  MD: 0.055,
  ME: 0.058,
  MN: 0.068,
  MO: 0.046,
  MT: 0.052,
  NE: 0.052,
  NJ: 0.062,
  NM: 0.049,
  NY: 0.065,
  ND: 0.020,
  OH: 0.038,
  OK: 0.045,
  OR: 0.075,
  RI: 0.055,
  SC: 0.060,
  VA: 0.052,
  VT: 0.058,
  WI: 0.053,
  WV: 0.048,   // rates reduced in 2025
};

const calculateNetIncome = (grossIncome, state) => {
  // 1. FICA (Social Security 6.2% up to $176,100 + Medicare 1.45%)
  const ssTax = Math.min(grossIncome, 176100) * 0.062;
  const medicareTax = grossIncome * 0.0145;
  // Additional 0.9% Medicare surtax on income over $200k (single filer)
  const medicareHighEarnerSurtax = grossIncome > 200000 ? (grossIncome - 200000) * 0.009 : 0;
  const totalFica = ssTax + medicareTax + medicareHighEarnerSurtax;

  // 2. Federal Income Tax (2025 Single Filer Brackets)
  const stdDeduction = 15000;
  const taxableIncome = Math.max(0, grossIncome - stdDeduction);

  let fedTax = 0;
  const brackets = [
    { limit: 11925,  rate: 0.10 },
    { limit: 48475,  rate: 0.12 },
    { limit: 103350, rate: 0.22 },
    { limit: 197300, rate: 0.24 },
    { limit: 250525, rate: 0.32 },
    { limit: 626350, rate: 0.35 },
  ];

  let previousLimit = 0;
  for (const bracket of brackets) {
    if (taxableIncome > bracket.limit) {
      fedTax += (bracket.limit - previousLimit) * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      fedTax += (taxableIncome - previousLimit) * bracket.rate;
      previousLimit = taxableIncome;
      break;
    }
  }
  if (taxableIncome > previousLimit) {
    fedTax += (taxableIncome - previousLimit) * 0.37;
  }

  // 3. State Tax
  const stateCode = state.toUpperCase();
  const stateTaxRate = STATE_TAX_RATES[stateCode] ?? 0.045;
  const stateTax = taxableIncome * stateTaxRate;

  const totalTaxes = totalFica + fedTax + stateTax;
  const netAnnual = grossIncome - totalTaxes;

  return {
    annualNet: Math.round(netAnnual),
    monthlyNet: Math.round(netAnnual / 12),
    totalTax: Math.round(totalTaxes),
    effectiveRate: (totalTaxes / grossIncome) * 100,
  };
};

module.exports = calculateNetIncome;