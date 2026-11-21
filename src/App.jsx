import React, { useMemo, useState } from 'react';
import NumberField from './components/NumberField.jsx';
import ProjectionChart from './components/ProjectionChart.jsx';
import Insights from './components/Insights.jsx';
import { DEFAULTS, retirementPlan, extraMonthlyNeeded, budgetCheck, emergencyFundMonths, validateInputs, money } from './lib/finance.js';
import { buildInsights } from './lib/insights.js';

const BUDGET_DEFAULTS = { takeHome: 3800, needs: 2100, wants: 1000, savings: 700, cash: 2500 };

export default function App() {
  const [tab, setTab] = useState('retirement');
  const [plan, setPlan] = useState(DEFAULTS);
  const [budget, setBudget] = useState(BUDGET_DEFAULTS);
  const [saved, setSaved] = useState([]);

  const errors = validateInputs(plan);
  const valid = Object.keys(errors).length === 0;
  const result = useMemo(() => (valid ? retirementPlan(plan) : null), [plan, valid]);
  const extra = useMemo(() => (valid ? extraMonthlyNeeded(plan) : 0), [plan, valid]);
  const insights = useMemo(() => (valid ? buildInsights(plan, budget) : []), [plan, budget, valid]);
  const b = budgetCheck(budget);

  const setP = key => v => setPlan(p => ({ ...p, [key]: v }));
  const setB = key => v => setBudget(x => ({ ...x, [key]: v }));
  const saveScenario = () => setSaved(s => [...s.slice(-2), { name: `Scenario ${s.length + 1}`, plan, result }]);

  return (
    <>
      <nav className="navbar brand-bar">
        <div className="container">
          <span className="navbar-brand fw-bold text-white">LifePlan <span className="fw-normal small">· financial wellness prototype</span></span>
        </div>
      </nav>

      <main className="container py-4">
        <ul className="nav nav-pills mb-4" role="tablist">
          {[['retirement', 'Retirement'], ['budget', 'Budget check'], ['compare', `Compare (${saved.length})`]].map(([id, label]) => (
            <li className="nav-item" key={id} role="presentation">
              <button className={`nav-link ${tab === id ? 'active' : ''}`} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
            </li>
          ))}
        </ul>

        {tab === 'retirement' && (
          <div className="row g-4">
            <div className="col-lg-4">
              <form className="card shadow-sm" onSubmit={e => e.preventDefault()} aria-labelledby="inputs-title">
                <div className="card-body">
                  <h2 id="inputs-title" className="h5">Your situation</h2>
                  <div className="row">
                    <div className="col-6"><NumberField id="age" label="Current age" value={plan.currentAge} onChange={setP('currentAge')} error={errors.currentAge} /></div>
                    <div className="col-6"><NumberField id="retire" label="Retire at" value={plan.retireAge} onChange={setP('retireAge')} error={errors.retireAge} /></div>
                  </div>
                  <NumberField id="salary" label="Annual salary" prefix="$" step={1000} value={plan.salary} onChange={setP('salary')} error={errors.salary} />
                  <NumberField id="balance" label="Current savings" prefix="$" step={500} value={plan.balance} onChange={setP('balance')} error={errors.balance} />
                  <NumberField id="monthly" label="You save each month" prefix="$" step={25} value={plan.monthly} onChange={setP('monthly')} error={errors.monthly} />
                  <NumberField id="match" label="Employer match" suffix="% of salary" step={0.5} value={plan.matchPct} onChange={setP('matchPct')} />
                  <div className="row">
                    <div className="col-6"><NumberField id="return" label="Return" suffix="%" step={0.5} value={plan.annualReturn} onChange={setP('annualReturn')} error={errors.annualReturn} /></div>
                    <div className="col-6"><NumberField id="inflation" label="Inflation" suffix="%" step={0.5} value={plan.inflation} onChange={setP('inflation')} error={errors.inflation} /></div>
                  </div>
                  <NumberField id="replace" label="Income goal" suffix="% of salary" step={5} value={plan.replacementPct} onChange={setP('replacementPct')} help="Many planners suggest 60–80%." />
                  <NumberField id="gov" label="Government benefits" prefix="$" suffix="/month" step={50} value={plan.govMonthly} onChange={setP('govMonthly')} help="Estimated CPP + OAS in today's dollars." />
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPlan(DEFAULTS)}>Reset</button>
                    <button type="button" className="btn btn-dark btn-sm" disabled={!valid} onClick={saveScenario}>Save scenario</button>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-lg-8">
              {result ? (
                <>
                  <div className="row g-3 mb-4">
                    <Kpi label="At retirement" value={money(result.balanceAtRetirement)} hint={`${money(result.realBalanceAtRetirement)} in today's dollars`} />
                    <Kpi label="Monthly income" value={money(result.projected)} hint={`goal ${money(result.target)}`} />
                    <Kpi label="On track" value={`${result.onTrackPct.toFixed(0)}%`} hint={result.gap ? `gap ${money(result.gap)}/mo` : 'goal met'} tone={result.gap ? 'warning' : 'success'} />
                  </div>
                  <div className="progress mb-4" role="progressbar" aria-label="Retirement readiness" aria-valuenow={Math.round(result.onTrackPct)} aria-valuemin="0" aria-valuemax="100" style={{ height: 12 }}>
                    <div className={`progress-bar ${result.gap ? 'bg-warning' : 'bg-success'}`} style={{ width: `${result.onTrackPct}%` }} />
                  </div>
                  <section className="card shadow-sm mb-4" aria-labelledby="chart-title">
                    <div className="card-body">
                      <h2 id="chart-title" className="h5">Savings projection</h2>
                      <ProjectionChart rows={result.rows} />
                      {result.gap > 0 && Number.isFinite(extra) && (
                        <p className="mt-3 mb-0">To close the gap, save about <strong>{money(extra)}</strong> more per month
                          <button type="button" className="btn btn-link btn-sm" onClick={() => setP('monthly')(plan.monthly + extra)}>Apply</button></p>
                      )}
                    </div>
                  </section>
                  <Insights items={insights} />
                </>
              ) : (
                <div className="alert alert-danger" role="alert">Fix the highlighted fields to see your projection.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'budget' && (
          <div className="row g-4">
            <div className="col-lg-4">
              <form className="card shadow-sm" onSubmit={e => e.preventDefault()}>
                <div className="card-body">
                  <h2 className="h5">Monthly budget</h2>
                  <NumberField id="takehome" label="Take-home pay" prefix="$" step={100} value={budget.takeHome} onChange={setB('takeHome')} />
                  <NumberField id="needs" label="Needs (rent, groceries, bills)" prefix="$" step={50} value={budget.needs} onChange={setB('needs')} />
                  <NumberField id="wants" label="Wants (dining, fun)" prefix="$" step={50} value={budget.wants} onChange={setB('wants')} />
                  <NumberField id="savings" label="Savings" prefix="$" step={50} value={budget.savings} onChange={setB('savings')} />
                  <NumberField id="cash" label="Emergency cash on hand" prefix="$" step={100} value={budget.cash} onChange={setB('cash')} />
                </div>
              </form>
            </div>
            <div className="col-lg-8">
              <section className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="h5">50 / 30 / 20 check <span className={`badge ms-2 text-bg-${b.status === 'healthy' ? 'success' : b.status === 'over' ? 'danger' : 'warning'}`}>{b.status}</span></h2>
                  {[['Needs', b.needsPct, 50, 'bg-primary'], ['Wants', b.wantsPct, 30, 'bg-info'], ['Savings', b.savingsPct, 20, 'bg-success']].map(([name, pct, target, cls]) => (
                    <div key={name} className="mb-3">
                      <div className="d-flex justify-content-between small"><span>{name}</span><span>{pct.toFixed(0)}% <span className="text-body-secondary">(guideline {target}%)</span></span></div>
                      <div className="progress" role="progressbar" aria-label={`${name} ${pct.toFixed(0)} percent`} aria-valuenow={Math.round(pct)} aria-valuemin="0" aria-valuemax="100">
                        <div className={`progress-bar ${cls}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  ))}
                  <p className="mb-0 small">Emergency fund covers <strong>{emergencyFundMonths(budget.cash, budget.needs).toFixed(1)} months</strong> of essentials. {b.unassigned >= 0 ? `${money(b.unassigned)} left unassigned.` : `Over budget by ${money(-b.unassigned)}.`}</p>
                </div>
              </section>
              <Insights items={insights} />
            </div>
          </div>
        )}

        {tab === 'compare' && (
          <section className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5">Compare scenarios</h2>
              {saved.length === 0 ? <p className="text-body-secondary mb-0">Save up to 3 scenarios on the Retirement tab to compare them here.</p> : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead><tr><th>Scenario</th><th className="text-end">Save / month</th><th className="text-end">Retire at</th><th className="text-end">Balance</th><th className="text-end">Income / month</th><th className="text-end">On track</th></tr></thead>
                    <tbody>{saved.map(s => (
                      <tr key={s.name}><td>{s.name}</td><td className="text-end">{money(s.plan.monthly)}</td><td className="text-end">{s.plan.retireAge}</td>
                        <td className="text-end">{money(s.result.balanceAtRetirement)}</td><td className="text-end">{money(s.result.projected)}</td><td className="text-end">{s.result.onTrackPct.toFixed(0)}%</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        <p className="small text-body-secondary mt-4 mb-0">Educational prototype with simplified assumptions. Not financial advice.</p>
      </main>
    </>
  );
}

function Kpi({ label, value, hint, tone }) {
  return (
    <div className="col-sm-4">
      <div className={`card h-100 shadow-sm ${tone ? `border-${tone}` : ''}`}>
        <div className="card-body py-3">
          <div className="small text-uppercase text-body-secondary">{label}</div>
          <div className="fs-4 fw-semibold">{value}</div>
          <div className="small text-body-secondary">{hint}</div>
        </div>
      </div>
    </div>
  );
}
