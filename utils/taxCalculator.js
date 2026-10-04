/**
 * Estimates net annual income based on 2026 US tax rules.
 * @param {number} grossIncome - Total annual salary
 * @param {string} state - Two-letter state code (e.g., 'NY', 'TX')
 * @returns {object} Breakdown of taxes and net pay
 */

// 2026 state income tax estimates. Flat-rate states use their statutory rates;
// progressive-state rates are rough effective-rate estimates, not bracket calculations.
// State tax is approximated using federal taxable income and excludes local taxes.
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

  // Flat-rate states
  AZ: 0.025,   // flat 2.5%
  CO: 0.044,
  GA: 0.0519,  // flat rate after 2025 tax reduction
  IL: 0.0495,
  IN: 0.0295,  // reduced to 2.95% in 2026
  IA: 0.038,
  KY: 0.035,   // reduced to 3.5% in 2026
  LA: 0.030,
  MA: 0.050,
  MI: 0.0425,
  MS: 0.040,   // reduced to 4% in 2026
  NC: 0.0399,  // reduced to 3.99% in 2026
  PA: 0.0307,
  UT: 0.045,

  // Progressive states — estimated effective rates at ~$75k gross
  AL: 0.040,
  AR: 0.042,
  CA: 0.072,
  CT: 0.055,
  DE: 0.052,
  HI: 0.075,
  ID: 0.053,
  KS: 0.048,
  MD: 0.055,
  ME: 0.058,
  MN: 0.068,
  MO: 0.046,
  MT: 0.050,
  NE: 0.0455,
  NJ: 0.062,
  NM: 0.049,
  NY: 0.065,
  ND: 0.020,
  OH: 0.023,
  OK: 0.045,
  OR: 0.075,
  RI: 0.055,
  SC: 0.060,
  VA: 0.052,
  VT: 0.058,
  WI: 0.053,
  WV: 0.048,
};

const calculateNetIncome = (grossIncome, state) => {
  // 1. FICA (2026 Social Security wage base: $184,500)
  const ssTax = Math.min(grossIncome, 184500) * 0.062;
  const medicareTax = grossIncome * 0.0145;
  // Additional 0.9% Medicare surtax on income over $200k (single filer)
  const medicareHighEarnerSurtax = grossIncome > 200000 ? (grossIncome - 200000) * 0.009 : 0;
  const totalFica = ssTax + medicareTax + medicareHighEarnerSurtax;

  // 2. Federal Income Tax (2026 single-filer rates; IRS Rev. Proc. 2025-32)
  const stdDeduction = 16100;
  const taxableIncome = Math.max(0, grossIncome - stdDeduction);

  let fedTax = 0;
  const brackets = [
    { limit: 12400,  rate: 0.10 },
    { limit: 50400,  rate: 0.12 },
    { limit: 105700, rate: 0.22 },
    { limit: 201775, rate: 0.24 },
    { limit: 256225, rate: 0.32 },
    { limit: 640600, rate: 0.35 },
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