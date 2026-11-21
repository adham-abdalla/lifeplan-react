// Plain-language "insights": rule-based recommendations generated from the numbers.
// Each insight explains WHY it appears, so the advice is transparent and testable.
import { retirementPlan, extraMonthlyNeeded, budgetCheck, emergencyFundMonths, money } from './finance.js';

export function buildInsights(plan, budget) {
  const out = [];
  const r = retirementPlan(plan);
  if (r.gap === 0) {
    out.push({ level: 'success', title: "You're on track for retirement",
      text: `Projected income of ${money(r.projected)}/month meets your ${money(r.target)}/month goal.` });
  } else {
    const extra = extraMonthlyNeeded(plan);
    out.push({ level: 'warning', title: 'Retirement income gap',
      text: Number.isFinite(extra)
        ? `You're ${money(r.gap)}/month short. Saving about ${money(extra)} more per month would close the gap.`
        : `You're ${money(r.gap)}/month short. Consider retiring later or lowering the income goal.` });
  }
  if (plan.matchPct > 0 && plan.monthly * 12 < plan.salary * (plan.matchPct / 100)) {
    out.push({ level: 'info', title: 'Collect the full employer match',
      text: `Your employer matches up to ${plan.matchPct}% of salary. Contributing at least ${money((plan.salary * plan.matchPct) / 100 / 12)}/month is free money.` });
  }
  if (budget) {
    const b = budgetCheck(budget);
    if (b.status === 'over') out.push({ level: 'danger', title: 'Spending is above take-home pay', text: `You're over by ${money(-b.unassigned)} per month.` });
    else if (b.savingsPct < 20) out.push({ level: 'info', title: 'Savings below 20%', text: `You save ${b.savingsPct.toFixed(0)}% of take-home pay; the 50/30/20 guideline suggests 20%.` });
    const months = emergencyFundMonths(budget.cash ?? 0, budget.needs);
    if (months < 3) out.push({ level: 'warning', title: 'Build an emergency fund',
      text: `Your cash covers ${months.toFixed(1)} months of essentials. Aim for 3–6 months (${money(budget.needs * 3)}–${money(budget.needs * 6)}).` });
  }
  if (plan.retireAge - plan.currentAge >= 30 && plan.annualReturn < 4) {
    out.push({ level: 'info', title: 'Long time horizon', text: 'With 30+ years to go, a low expected return may understate growth. Review your investment mix with an advisor.' });
  }
  return out;
}
