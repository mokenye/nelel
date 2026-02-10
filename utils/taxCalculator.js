/**
 * Estimates Net Annual Income based on 2024 US Tax Rules
 * @param {number} grossIncome - Total annual salary
 * @param {string} state - Two-letter state code (e.g., 'NY', 'TX')
 * @returns {object} Breakdown of taxes and net pay
 */
const calculateNetIncome = (grossIncome, state) => {
    // 1. FICA (Social Security 6.2% up to $168,600 + Medicare 1.45%)
    const ssTax = Math.min(grossIncome, 168600) * 0.062;
    const medicareTax = grossIncome * 0.0145;
    const totalFica = ssTax + medicareTax;

    // 2. Federal Income Tax (Simplified 2024 Single Filer Brackets)
    const stdDeduction = 14600;
    const taxableIncome = Math.max(0, grossIncome - stdDeduction);
    
    let fedTax = 0;
    const brackets = [
        { limit: 11600, rate: 0.10 },
        { limit: 47150, rate: 0.12 },
        { limit: 100525, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243725, rate: 0.32 }
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
        fedTax += (taxableIncome - previousLimit) * 0.35; // Top tier simplified
    }

    // 3. State Tax (Categorized)
    const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'];
    const highTaxStates = ['CA', 'NY', 'NJ', 'OR', 'MN']; // Estimated higher avg
    
    let stateTaxRate = 0.045; // Default average for flat/middle states
    if (noTaxStates.includes(state.toUpperCase())) stateTaxRate = 0;
    if (highTaxStates.includes(state.toUpperCase())) stateTaxRate = 0.07;

    const stateTax = taxableIncome * stateTaxRate;

    const netAnnual = grossIncome - totalFica - fedTax - stateTax;

    return {
        annualNet: Math.round(netAnnual),
        monthlyNet: Math.round(netAnnual / 12),
        totalTax: Math.round(totalFica + fedTax + stateTax),
        effectiveRate: ((totalFica + fedTax + stateTax) / grossIncome) * 100
    };
};

module.exports = calculateNetIncome;