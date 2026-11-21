# LifePlan: financial wellness planner (React)

[![Test, build and deploy](https://github.com/adham-abdalla/lifeplan-react/actions/workflows/ci-deploy.yml/badge.svg)](https://github.com/adham-abdalla/lifeplan-react/actions/workflows/ci-deploy.yml)
![React 18](https://img.shields.io/badge/React-18-61dafb)
![Webpack 5](https://img.shields.io/badge/Webpack-5-8dd6f9)
![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5-7952b3)

**▶ Live demo: [adham-abdalla.github.io/lifeplan-react](https://adham-abdalla.github.io/lifeplan-react/)**

A front-end prototype that helps people answer *"Am I on track for retirement?"* and *"Is my monthly budget healthy?"*, with clear numbers and plain-language advice. It was built from idea → requirements → working prototype, the way a front-end co-op would take a concept to a stakeholder demo.

## Features

| Area | What it does |
|---|---|
| **Retirement projection** | Year-by-year savings growth with employer match, investment return and inflation; SVG chart of balance vs contributions |
| **Readiness score** | Converts savings into monthly retirement income (annuity formula) plus government benefits, and compares it with your income goal |
| **Gap solver** | Finds the exact extra monthly saving that closes the gap (binary search), with a one-click "Apply" |
| **Budget check** | 50/30/20 rule with progress bars and emergency-fund coverage in months |
| **Insights** | Rule-based, explainable recommendations (e.g. "collect the full employer match"). Each tip says *why* it appears |
| **Scenario compare** | Save up to 3 plans and compare them side by side |
| **Validation and accessibility** | Inline errors, labelled inputs, `aria-live` insights, accessible chart description, keyboard-friendly tabs |

## Tech

- **React 18** function components and hooks (`useState`, `useMemo`)
- **Webpack 5** + Babel (ES6+/JSX), CSS loaders, HTML plugin, dev server with hot reload
- **Bootstrap 5** layout and components, with a small custom theme
- **No chart library:** the projection chart is hand-built SVG
- **Business logic separated from UI** in `src/lib/` as plain ES modules, unit tested with Node's test runner
- **CI/CD:** GitHub Actions installs, tests, builds and deploys to GitHub Pages on every push

```bash
npm install
npm start        # dev server on http://localhost:3000
npm test         # 12 unit tests for the calculations
npm run build    # production bundle in dist/
```

## How the numbers work

| Step | Formula |
|---|---|
| Monthly growth | `balance = balance × (1 + r) + contribution`, where `r = (1 + annual)^(1/12) − 1` |
| Employer match | `salary × match% ÷ 12` added to each monthly contribution |
| Today's dollars | `balance ÷ (1 + inflation)^years` |
| Retirement income | Annuity: `PMT = B × r ÷ (1 − (1 + r)^−n)` over the years in retirement, using the real return |
| Gap | `max(0, goal − (savings income + government benefits))` |

See [docs/TESTING.md](docs/TESTING.md) for the test cases that verify each formula.

## Project structure

```
src/
├── index.jsx              React entry point (imports Bootstrap)
├── App.jsx                Tabs: Retirement, Budget check, Compare
├── components/
│   ├── NumberField.jsx    Accessible labelled input with validation
│   ├── ProjectionChart.jsx  Dependency-free SVG chart
│   └── Insights.jsx       Explainable recommendations
├── lib/
│   ├── finance.js         Pure calculation functions
│   └── insights.js        Recommendation rules
└── styles.css
tests/finance.test.js      Unit tests (node:test)
webpack.config.js
```

## Next steps
- [ ] Component tests with React Testing Library
- [ ] Save scenarios to local storage and export to PDF
- [ ] An AI assistant that explains the plan in plain language (see my [benefits assistant](https://github.com/adham-abdalla/benefits-assistant-rag) for the retrieval-augmented approach)

*Educational prototype with simplified assumptions. Not financial advice.*

---
Built by **Adham Abdalla** · [GitHub](https://github.com/adham-abdalla) · MIT License
