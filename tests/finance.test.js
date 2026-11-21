import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../src/lib/finance.js';
import { buildInsights } from '../src/lib/insights.js';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test('TC-01 zero return: balance = starting amount + all contributions', () => {
  const rows = f.projectSavings({ ...f.DEFAULTS, annualReturn: 0, inflation: 0, balance: 1000, monthly: 100, matchPct: 0, currentAge: 30, retireAge: 32 });
  assert.equal(rows.length, 3);
  near(rows.at(-1).balance, 1000 + 100 * 24);
});

test('TC-02 compound growth matches the future-value formula', () => {
  // $10,000 for 10 years at 6%/year, no contributions: 10000 * 1.06^10
  const rows = f.projectSavings({ ...f.DEFAULTS, balance: 10000, monthly: 0, matchPct: 0, annualReturn: 6, currentAge: 30, retireAge: 40 });
  near(rows.at(-1).balance, 10000 * Math.pow(1.06, 10), 0.01);
});

test('TC-03 employer match is added to contributions', () => {
  const p = { ...f.DEFAULTS, annualReturn: 0, inflation: 0, balance: 0, monthly: 0, salary: 60000, matchPct: 5, currentAge: 30, retireAge: 31 };
  near(f.projectSavings(p).at(-1).balance, 3000);
});

test('TC-04 inflation reduces real (today\'s dollars) balance', () => {
  const rows = f.projectSavings({ ...f.DEFAULTS, balance: 1000, monthly: 0, matchPct: 0, annualReturn: 0, inflation: 2, currentAge: 30, retireAge: 31 });
  near(rows.at(-1).realBalance, 1000 / 1.02);
});

test('TC-05 annuity income: zero rate divides evenly; positive rate matches formula', () => {
  near(f.monthlyIncome(120000, 10, 0), 1000);
  const r = Math.pow(1.05, 1 / 12) - 1;
  near(f.monthlyIncome(100000, 20, 5), (100000 * r) / (1 - Math.pow(1 + r, -240)));
  assert.equal(f.monthlyIncome(5000, 0, 5), 0);
});

test('TC-06 gap is zero when government benefits alone meet the target', () => {
  const r = f.retirementPlan({ ...f.DEFAULTS, salary: 24000, replacementPct: 70, govMonthly: 1500 });
  assert.equal(r.gap, 0); // target 1,400 < 1,500
  assert.equal(r.onTrackPct, 100);
});

test('TC-07 extra monthly saving needed actually closes the gap (and one dollar less does not)', () => {
  const p = { ...f.DEFAULTS, monthly: 100 };
  const extra = f.extraMonthlyNeeded(p);
  assert.ok(extra > 0 && Number.isFinite(extra));
  assert.equal(f.retirementPlan({ ...p, monthly: p.monthly + extra }).gap, 0);
  assert.ok(f.retirementPlan({ ...p, monthly: p.monthly + extra - 1 }).gap > 0);
});

test('TC-08 50/30/20 budget statuses', () => {
  assert.equal(f.budgetCheck({ takeHome: 4000, needs: 2000, wants: 1000, savings: 1000 }).status, 'healthy');
  assert.equal(f.budgetCheck({ takeHome: 4000, needs: 2600, wants: 1000, savings: 400 }).status, 'review');
  assert.equal(f.budgetCheck({ takeHome: 4000, needs: 3000, wants: 1500, savings: 0 }).status, 'over');
});

test('TC-09 input validation catches impossible values', () => {
  assert.deepEqual(f.validateInputs(f.DEFAULTS), {});
  const e = f.validateInputs({ ...f.DEFAULTS, currentAge: 70, retireAge: 65, annualReturn: 40, monthly: -5 });
  assert.deepEqual(Object.keys(e).sort(), ['annualReturn', 'monthly', 'retireAge']);
});

test('TC-10 insights: gap, employer match, emergency fund', () => {
  const plan = { ...f.DEFAULTS, monthly: 50, matchPct: 5 };
  const titles = buildInsights(plan, { takeHome: 3500, needs: 2000, wants: 900, savings: 600, cash: 1000 }).map(i => i.title);
  assert.ok(titles.includes('Retirement income gap'));
  assert.ok(titles.includes('Collect the full employer match'));
  assert.ok(titles.includes('Build an emergency fund'));
  assert.ok(titles.includes('Savings below 20%'));
});

test('TC-11 insights: on-track plan gets a success message and no gap warning', () => {
  const plan = { ...f.DEFAULTS, monthly: 2000 };
  const ins = buildInsights(plan);
  assert.equal(ins[0].level, 'success');
  assert.ok(!ins.some(i => i.title === 'Retirement income gap'));
});

test('TC-12 currency formatting', () => {
  assert.equal(f.money(1234.5), '$1,235');
  assert.equal(f.money(Infinity), '—');
});
