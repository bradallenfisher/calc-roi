# Product Requirements Document

## ASAP ECC ROI Calculator (Demo Version)

**Version:** 0.1 (Pre-Client Review)
**Platform:** Static HTML + Vanilla JavaScript
**Purpose:** Interactive demo calculator for client feedback

---

# 1. Objective

Build a simple, self-contained HTML + JavaScript ROI calculator that models the Excel workbook:

> `ASAP ECC ROI Calculator 20260130 JS.xlsx`

The calculator must:

* Replicate the spreadsheet logic exactly
* Surface operational and financial value outputs clearly
* Be structured for live critique in a client meeting
* Run entirely client-side (no backend required)
* Be easily modifiable in real time

This is a **conversation tool**, not a final product.

---

# 2. Primary Use Case

During a live meeting:

1. Client inputs their call volumes, time assumptions, and cost assumptions
2. Calculator immediately updates:

   * Time saved
   * Annual value
   * ROI
   * Operational impact metrics
3. Client critiques assumptions
4. Team adjusts inputs live

---

# 3. Scope

## In Scope

* Static HTML page
* Responsive layout
* Form validation
* Currency + percentage formatting
* Live recalculation on input change
* Clear output cards
* Expandable “Model Assumptions” section

## Out of Scope

* CRM integration
* PDF export
* Database persistence
* Authentication
* Multi-scenario comparison (future phase)

---

# 4. Functional Requirements

---

# 4.1 Inputs (User-Editable Fields)

These inputs directly map to Excel column G.

## Volume & Adoption

| Field                                  | Variable             | Type       | Required | Default                              |
| -------------------------------------- | -------------------- | ---------- | -------- | ------------------------------------ |
| Monthly alarm requests for service     | monthlyAlarmRequests | number     | Yes      | 1000                                 |
| Percent expected to transition to ASAP | asapTransitionPct    | percentage | Yes      | 100%                                 |
| Monthly 911 calls                      | monthly911Calls      | number     | Yes      | derived from alarm * 10 but editable |

---

## Current-State Call Handling (seconds)

| Field                                          | Variable       |
| ---------------------------------------------- | -------------- |
| Hold time on admin line                        | holdTime       |
| Number of callbacks needed                     | numCallbacks   |
| Time per callback (seconds)                    | callbackTime   |
| Avg telecommunicator processing time (seconds) | processingTime |

---

## Future-State (ASAP)

| Field                                                | Variable           |
| ---------------------------------------------------- | ------------------ |
| ASAP Service alarm request processing time (seconds) | asapProcessingTime |

---

## Cost Assumptions

| Field                                               | Variable           |
| --------------------------------------------------- | ------------------ |
| Avg telecommunicator burdened compensation (annual) | annualCompensation |
| Upfront implementation cost                         | upfrontCost        |
| Recurring annual CAD interface maintenance fee      | recurringCost      |
| Cost of living comp increase per year (%)           | colaPercent        |

---

# 5. Derived Calculations (Must Match Excel Logic)

---

## 5.1 Derived Values

### Alarm Requests Transitioned

```
transitionedRequests = monthlyAlarmRequests * asapTransitionPct
```

---

## 5.2 Time Calculations

### Current Total Dispatch Time per Alarm

```
currentDispatchTime = holdTime + (numCallbacks * callbackTime) + processingTime
```

### Time Saved Per Alarm (seconds)

```
secondsSavedPerAlarm = currentDispatchTime - asapProcessingTime
```

---

### Monthly Reallocated Telecommunicator Time (hours)

⚠ IMPORTANT: Spreadsheet excludes hold time.

```
monthlyReallocatedHours =
  (transitionedRequests * ((numCallbacks * callbackTime) + processingTime)) / 3600
```

---

### Annual Reallocated Hours

```
annualReallocatedHours = monthlyReallocatedHours * 12
```

---

### Seconds Saved Per 911 Call

```
secondsSavedPer911Call =
  (annualReallocatedHours * 3600) / monthly911Calls
```

---

## 5.3 Labor Cost Calculations

### Hourly Rate

```
hourlyRate = annualCompensation / 2080
```

### Monthly Value of Reallocated Time

```
monthlyValue = monthlyReallocatedHours * hourlyRate
```

### Annual Value of Reallocated Time

```
annualValue = monthlyValue * 12
```

---

## 5.4 ROI Calculation (Match Excel Exactly)

Excel Formula:

```
ROI = (annualValue - recurringCost) / ABS(upfrontCost) + colaPercent
```

⚠ Note: This is not a standard ROI formula.
Do NOT modify unless client directs.

---

# 6. Outputs (Display Cards)

---

## 6.1 Headline Financial Outputs

Display as large metric cards:

* Annual Value of Reallocated Time
* Recurring Annual Fee
* Upfront Cost
* ROI (%)
* (Optional) Payback Period (calculated as upfrontCost / (annualValue - recurringCost))

---

## 6.2 Operational Outputs

Display in secondary cards:

* Monthly Reallocated Hours
* Annual Reallocated Hours
* Seconds Saved Per 911 Call
* Seconds Saved Per Alarm
* Annual Hours Saved from Alarm Processing

---

# 7. UI Requirements

---

## Layout Structure

### Section 1 — Inputs (Left column or top block)

Grouped with headers:

* Volume & Adoption
* Current State
* Future State
* Cost Assumptions

---

### Section 2 — Results (Top highlight band)

Large bold ROI and Annual Value

---

### Section 3 — Operational Impact

Cards showing time-based metrics

---

### Section 4 — Assumptions Panel (Collapsible)

Toggle:
“View Model Assumptions”

Shows:

* Formula definitions
* 2080 annual hours assumption
* ROI formula logic
* Notes about hold time exclusion

---

# 8. Non-Functional Requirements

* No external frameworks required
* Vanilla JS only
* Single HTML file acceptable
* Must run offline
* No API calls
* Clean, readable code for live editing

---

# 9. Edge Case Handling

If:

* Upfront cost = 0 → ROI should show “N/A”
* AnnualValue < RecurringCost → ROI can be negative
* Percent > 100 → validation error
* Negative inputs → validation error

---

# 10. Open Questions for Client (Bring to Meeting)

1. Should hold time count toward reallocated TC time?
2. Should COLA affect compensation instead of ROI?
3. Should ROI be shown as:

   * Percentage?
   * Dollar net benefit?
4. Should payback period be highlighted?
5. Should we include staffing FTE equivalent?

   ```
   FTE Equivalent = annualReallocatedHours / 2080
   ```

---

# 11. Future Phase Ideas (Do Not Build Yet)

* Multi-scenario comparison
* 3-year projection model
* Staffing avoidance model
* PDF export
* CRM capture

---

# 12. Acceptance Criteria

The demo is complete when:

* All Excel formulas produce identical outputs
* Inputs update outputs instantly
* Financial outputs are clearly visible
* Client can challenge assumptions live
* No console errors
* Code is structured and readable

---

# 13. Suggested File Structure

Single file acceptable:

```
/roi-demo
  index.html
```

Optional:

```
styles.css
calculator.js
```

---

# Final Recommendation

Walk into the meeting showing:

* ROI
* Annual value
* Seconds saved per 911 call
* Annual hours reallocated

Then let the client critique the assumptions.

That positions you as:
✔ Strategic
✔ Data-driven
✔ Flexible

---