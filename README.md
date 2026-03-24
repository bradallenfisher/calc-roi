# ASAP ECC ROI Calculator

Interactive demo calculator for ASAP Service ROI. Static HTML + Vanilla JavaScript, runs client-side with no backend.

**Calculation source:** `ASAP ECC ROI Calculator 20260324 JS.xlsx` (Calc sheet). Cost tiers: Categories sheet (same as ROI Cost Categories).

## Quick Start

1. Open `index.html` in a browser, or serve locally:
   ```bash
   python3 -m http.server 8080
   ```
2. Enter **Population Served** and **Monthly 911 Calls** (required), optionally **Monthly Alarm Requests**.
3. Click **Calculate ROI** to see results.

## Inputs

| Field | Required | Notes |
|-------|----------|-------|
| Population Served | Yes | Used for upfront & recurring cost lookup |
| Monthly 911 Calls | Yes | |
| Monthly Alarm Requests | No | If blank, auto-calculated as 10% of 911 calls |

## Outputs (Benefits Realized)

- Minutes to Dispatch Saved Per Incident
- Telecommunicator Time Saved Per Incident (min)
- Monthly Telecommunicator Hours Saved
- Monthly Value of Reallocated Time
- Annual Value of Reallocated Time
- Return on Investment
- Payback Period (months)

## Key formulas (from Calc sheet)

- Times are in **minutes** (ASAP processing = 20/60 min).
- **Total time including hold:** `holdPerCall × (1 + callbacks) + initialProcessing + callbacks × timePerCallback`
- **Monthly reallocated (minutes):** `transitionedAlarms × (initialProcessing + callbacks × timePerCallback)` — hold excluded for ECC reallocation.
- **ROI:** `(annualValue − recurring) / ABS(upfront) + COLA` (decimal COLA, display as %).
- **Payback (months):** nested rule comparing `(upfront + n×recurring) / monthlyValue` to thresholds 12, 24, 36, 48, 60; otherwise display `>5`.

## Cost Lookups (Categories sheet)

| Population | Upfront Cost | Recurring/Year |
|------------|--------------|----------------|
| ≥ 2,500,000 | $82,160 | $4,500 |
| 500,000 – 2,499,999 | $56,080 | $3,600 |
| 100,000 – 499,999 | $40,720 | $2,700 |
| &lt; 100,000 | $28,040 | $1,800 |

## Project Structure

```
calcroi/
├── index.html
├── styles.css
├── calculator.js
├── ASAP ECC ROI Calculator 20260324 JS.xlsx
├── extract_excel_formulas.py
└── venv/
```

## Assumptions (see footer in app)

- 75% transition; hold 2 min/call; initial call 1.5 min; 2 callbacks at 1 min; ASAP 20 sec; $79,500 comp; 3% COLA.
