// Pure financial calculations (no React) so they can be unit tested on their own.
// All amounts are in dollars; rates are yearly percentages (e.g. 6 means 6%).

export const DEFAULTS = {
  currentAge: 25,
  retireAge: 65,
  salary: 60000,
  balance: 5000,
  monthly: 300,
  matchPct: 3,          // employer matches this % of salary
  annualReturn: 6,
  inflation: 2,
  replacementPct: 70,   // target retirement income as % of salary
  govMonthly: 1500,     // estimated CPP + OAS per month (today's dollars)
  yearsInRetirement: 25,
};

const monthlyRate = annualPct => Math.pow(1 + annualPct / 100, 1 / 12) - 1;

// Year-by-year projection of savings until retirement.
export function projectSavings(p) {
  const years = Math.max(0, p.retireAge - p.currentAge);
  const r = monthlyRate(p.annualReturn);
  const employerMonthly = (p.salary * (p.matchPct / 100)) / 12;
  const contribution = p.monthly + employerMonthly;
  let balance = p.balance;
  let contributed = p.balance;
  const rows = [{ age: p.currentAge, balance, contributed, realBalance: balance }];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + contribution;
      contributed += contribution;
    }
    const realBalance = balance / Math.pow(1 + p.inflation / 100, y);
    rows.push({ age: p.currentAge + y, balance, contributed, realBalance });
  }
  return rows;
}

// Monthly income a balance can pay for n years (annuity formula), in the same dollars as the balance.
export function monthlyIncome(balance, years, annualPct) {
  const n = years * 12;
  if (n <= 0) return 0;
  const r = monthlyRate(annualPct);
  if (r === 0) return balance / n;
  return (balance * r) / (1 - Math.pow(1 + r, -n));
}

// Retirement readiness in today's dollars.
export function retirementPlan(p) {
  const rows = projectSavings(p);
  const atRetirement = rows[rows.length - 1];
  // In retirement, assume returns stay ahead of inflation by (return - inflation).
  const realReturn = ((1 + p.annualReturn / 100) / (1 + p.inflation / 100) - 1) * 100;
  const savingsIncome = monthlyIncome(atRetirement.realBalance, p.yearsInRetirement, realReturn);
  const target = (p.salary * p.replacementPct) / 100 / 12;
  const projected = savingsIncome + p.govMonthly;
  const gap = Math.max(0, target - projected);
  return {
    rows,
    balanceAtRetirement: atRetirement.balance,
    realBalanceAtRetirement: atRetirement.realBalance,
    savingsIncome,
    govIncome: p.govMonthly,
    projected,
    target,
    gap,
    onTrackPct: target > 0 ? Math.min(100, (projected / target) * 100) : 100,
  };
}

// Extra monthly saving needed to close the gap (binary search, to the nearest dollar).
export function extraMonthlyNeeded(p) {
  if (retirementPlan(p).gap === 0) return 0;
  let lo = 0, hi = 20000;
  if (retirementPlan({ ...p, monthly: p.monthly + hi }).gap > 0) return Infinity;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (retirementPlan({ ...p, monthly: p.monthly + mid }).gap > 0) lo = mid; else hi = mid;
  }
  return hi;
}

// 50/30/20 budget check: needs / wants / savings as % of take-home pay.
export function budgetCheck({ takeHome, needs, wants, savings }) {
  const pct = v => (takeHome > 0 ? (v / takeHome) * 100 : 0);
  const res = { needsPct: pct(needs), wantsPct: pct(wants), savingsPct: pct(savings), unassigned: takeHome - needs - wants - savings };
  res.status = res.unassigned < 0 ? 'over' : res.needsPct <= 50 && res.savingsPct >= 20 ? 'healthy' : 'review';
  return res;
}

export function emergencyFundMonths(cash, monthlyExpenses) {
  return monthlyExpenses > 0 ? cash / monthlyExpenses : 0;
}

export function validateInputs(p) {
  const errors = {};
  if (!(p.currentAge >= 16 && p.currentAge <= 80)) errors.currentAge = 'Age must be between 16 and 80.';
  if (!(p.retireAge > p.currentAge && p.retireAge <= 75)) errors.retireAge = 'Retirement age must be after your current age and at most 75.';
  if (!(p.salary >= 0)) errors.salary = 'Salary cannot be negative.';
  if (!(p.balance >= 0)) errors.balance = 'Savings cannot be negative.';
  if (!(p.monthly >= 0)) errors.monthly = 'Monthly saving cannot be negative.';
  if (!(p.annualReturn >= -5 && p.annualReturn <= 15)) errors.annualReturn = 'Use a return between -5% and 15%.';
  if (!(p.inflation >= 0 && p.inflation <= 10)) errors.inflation = 'Use inflation between 0% and 10%.';
  return errors;
}

export const money = (v, digits = 0) =>
  Number.isFinite(v)
    ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: digits }).format(v)
    : '—';
