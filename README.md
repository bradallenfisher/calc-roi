# ASAP ECC ROI Calculator

Interactive demo calculator for ASAP Service ROI. Static HTML + Vanilla JavaScript, runs client-side with no backend.

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

## Outputs

- Minutes to Dispatch Saved/Incident
- Telecommunicator Time Saved/Incident (seconds)
- Monthly Telecommunicator Hours Saved
- Monthly Value of Reallocated Time
- Annual Value of Reallocated Time
- ROI

## Cost Lookups (ROI Cost Categories 20260227 JS.xlsx)

| Population | Upfront Cost | Recurring/Year |
|------------|--------------|----------------|
| ≥ 2,500,000 | $82,160 | $4,500 |
| 500,000 – 2,499,999 | $56,080 | $3,600 |
| 100,000 – 499,999 | $40,720 | $2,700 |
| &lt; 100,000 | $28,040 | $1,800 |

## Project Structure

```
calcroi/
├── index.html      # Main app
├── styles.css      # Layout & styling
├── calculator.js   # Calculation logic
├── PRD.md          # Product requirements (legacy)
├── requirements.txt
├── extract_excel_formulas.py   # Extracts formulas from Excel (requires venv)
├── ROI Cost Categories 20260227 JS.xlsx   # Cost lookup source
└── venv/           # Python venv for openpyxl
```

## Assumptions (from footer)

- 75% of alarm traffic will transition
- Hold time: 120 sec (2 min)
- Callbacks: 2.7
- Time per callback: 60 sec
- Processing time: 120 sec
- ASAP processing time: 20 sec
- Annual compensation: $79,500
- COLA: 3%
