# ASAP ECC ROI Calculator

Interactive demo calculator for ASAP Service ROI. Static HTML + Vanilla JavaScript, runs client-side with no backend.

## Quick Start

1. Open `index.html` in a browser, or serve locally:
   ```bash
   python3 -m http.server 8080
   ```
2. Enter inputs and click **Calculate ROI** to see results.

## Project Structure

```
calcroi/
├── index.html      # Main app
├── styles.css      # Layout & styling
├── calculator.js   # Calculation logic
├── PRD.md          # Product requirements
├── requirements.txt
├── extract_excel_formulas.py   # Extracts formulas from Excel (requires venv)
└── venv/           # Python venv for openpyxl
```

## Default Values

Default inputs match `ASAP ECC ROI Calculator 20260130 JS.xlsx` column G for testing parity.

---

## Model Assumptions (Dev Only)

**Do not expose these formulas publicly.** This section is for developer reference only.

### Formula Definitions

| Output | Formula |
|--------|---------|
| Transitioned Requests | `monthlyAlarmRequests × asapTransitionPct` |
| Current Dispatch Time | `holdTime + (numCallbacks × callbackTime) + processingTime` |
| Seconds Saved Per Alarm | `currentDispatchTime − asapProcessingTime` |
| Monthly Reallocated Hours | `(transitionedRequests × ((numCallbacks × callbackTime) + processingTime)) ÷ 3600` |
| Annual Reallocated Hours | `monthlyReallocatedHours × 12` |
| Seconds Saved Per 911 Call | `(annualReallocatedHours × 3600) ÷ monthly911Calls` |
| Hourly Rate | `annualCompensation ÷ 2080` |
| Monthly Value | `monthlyReallocatedHours × hourlyRate` |
| Annual Value | `monthlyValue × 12` |
| ROI | `(annualValue − recurringCost) ÷ ABS(upfrontCost) + colaPercent` |
| Payback Period | `upfrontCost ÷ (annualValue − recurringCost)` years |

### Notes

- **2080** = assumed annual work hours for hourly rate.
- **Hold time excluded:** Monthly reallocated hours use only callback time + processing time; hold time is not included (per spreadsheet logic).
- **ROI formula:** Matches Excel exactly; not standard ROI. Do not change unless client approves.
