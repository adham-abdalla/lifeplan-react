# Testing

**Summary:** 12 automated unit tests (calculations and insight rules) plus a manual UI checklist run on the live demo. All automated tests run in GitHub Actions before every deployment; a failing test blocks the deploy.

## Automated tests (`npm test`)

| ID | What is checked | Why it matters |
|---|---|---|
| TC-01 | With 0% return, the balance equals the starting amount plus every contribution | Catches off-by-one errors in the monthly loop |
| TC-02 | $10,000 at 6% for 10 years equals `10000 × 1.06^10` | Confirms monthly compounding matches the yearly rate |
| TC-03 | A 5% match on $60,000 adds exactly $3,000 per year | Employer match is calculated correctly |
| TC-04 | 2% inflation turns $1,000 into $980.39 in today's dollars | Real vs nominal values |
| TC-05 | Annuity payment matches the textbook formula; 0% rate and 0 years handled | Edge cases don't divide by zero |
| TC-06 | Government benefits alone can meet the goal, giving gap = 0 and 100% on track | Boundary case |
| TC-07 | The suggested extra saving closes the gap, and $1 less doesn't | Proves the solver returns the *minimum* amount |
| TC-08 | 50/30/20 returns healthy, review and over in the right situations | Budget status logic |
| TC-09 | Validation flags retirement age before current age, a 40% return and negative saving | Bad input never reaches the chart |
| TC-10 | Insights appear for an income gap, a missed employer match, a low emergency fund and low savings | Each rule fires when it should |
| TC-11 | An on-track plan shows a success message and no gap warning | Rules don't contradict each other |
| TC-12 | Currency formatting, including infinity shown as "—" | Display edge cases |

## Manual UI checklist

| # | Steps | Expected |
|---|---|---|
| UI-01 | Open the demo | Default plan shows 3 KPI cards, a progress bar, the chart and insights |
| UI-02 | Set "Retire at" to 20 | Field turns red with a message; the results area asks you to fix inputs |
| UI-03 | Click **Apply** under "To close the gap" | Monthly saving updates and on-track reaches 100% |
| UI-04 | Save two scenarios, open **Compare** | Both rows appear with their figures |
| UI-05 | Budget tab: set needs above take-home pay | Status badge shows "over" with a danger insight |
| UI-06 | Use only the keyboard (Tab / Enter) | Every input and tab is reachable, with a visible focus outline |
| UI-07 | Phone-width screen | Form stacks above the results; nothing overflows |
