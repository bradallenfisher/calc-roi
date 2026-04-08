/**
 * ASAP ECC ROI Calculator
 * Based on ASAP ECC ROI Calculator 20260406 JS.xlsx (Calc sheet)
 * Cost tiers from Categories sheet.
 */

(function () {
  'use strict';

  const COST_TIERS = [
    { popMin: 2500000, popMax: null, upfront: 82160, recurring: 4500 },
    { popMin: 500000, popMax: 2499999, upfront: 56080, recurring: 3600 },
    { popMin: 100000, popMax: 499999, upfront: 40720, recurring: 2700 },
    { popMin: 0, popMax: 99999, upfront: 28040, recurring: 1800 }
  ];

  const INPUTS = {
    populationServed: 'populationServed',
    monthly911Calls: 'monthly911Calls',
    monthlyAlarmRequests: 'monthlyAlarmRequests'
  };

  const OUTPUTS = {
    minutesDispatchSaved: 'minutes-dispatch-saved',
    tcTimeSaved: 'tc-time-saved',
    monthlyHoursSaved: 'monthly-hours-saved',
    monthlyValue: 'monthly-value',
    annualValue: 'annual-value',
    roi: 'roi',
    paybackMonths: 'payback-months'
  };

  // Defaults match Calc sheet G column (minutes unless noted)
  const DEFAULTS = {
    asapTransitionPct: 0.75,
    holdMinutesPerCall: 2,
    numCallbacksAfterFirst: 2,
    initialProcessingMinutes: 1.5,
    timePerFirstCallbackMinutes: 0.5,
    timePerSecondCallbackMinutes: 1.5,
    asapProcessingMinutes: 20 / 60,
    annualCompensation: 79500,
    colaPercent: 0.03
  };

  function getInput(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const val = parseFloat(String(el.value).replace(/,/g, ''));
    return isNaN(val) ? null : val;
  }

  function setOutput(id, value, formatter) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = formatter ? formatter(value) : String(value);
  }

  function lookupCosts(population) {
    if (population == null || population < 0) return { upfront: 0, recurring: 0 };
    for (const tier of COST_TIERS) {
      const aboveMin = tier.popMin === null || population >= tier.popMin;
      const belowMax = tier.popMax === null || population <= tier.popMax;
      if (aboveMin && belowMax) return { upfront: tier.upfront, recurring: tier.recurring };
    }
    return { upfront: 0, recurring: 0 };
  }

  function formatCurrency(value) {
    if (value == null || isNaN(value)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(value));
  }

  function formatPercent(value) {
    if (value == null || isNaN(value)) return '—';
    return (Math.round(value * 10) / 10).toFixed(1) + '%';
  }

  function formatNumber(value, decimals) {
    if (value == null || isNaN(value)) return '—';
    const d = decimals ?? 1;
    return (Math.round(value * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }

  /**
   * Payback months — Excel G34:
   * nested IF on (upfront + n*recurring) / monthlyValue vs 12,24,36,48,60
   */
  function computePaybackMonths(upfront, recurring, monthlyValue) {
    if (monthlyValue <= 0) return { numeric: null, display: '—' };
    const m = monthlyValue;
    const checks = [
      { threshold: 12, cost: upfront },
      { threshold: 24, cost: upfront + recurring },
      { threshold: 36, cost: upfront + recurring * 2 },
      { threshold: 48, cost: upfront + recurring * 3 },
      { threshold: 60, cost: upfront + recurring * 4 }
    ];
    for (const { threshold, cost } of checks) {
      const months = cost / m;
      if (months < threshold) {
        return { numeric: months, display: formatNumber(months, 1) };
      }
    }
    return { numeric: null, display: 'More than 5 Years' };
  }

  function validateInputs(data) {
    const errors = [];
    if (data.populationServed == null || data.populationServed <= 0) {
      errors.push('Population Served is required and must be positive');
    }
    if (data.monthly911Calls == null || data.monthly911Calls <= 0) {
      errors.push('Monthly 911 Calls is required and must be positive');
    }
    return errors;
  }

  function calculate() {
    const populationServed = getInput(INPUTS.populationServed);
    const monthly911Calls = getInput(INPUTS.monthly911Calls);
    let monthlyAlarmRequests = getInput(INPUTS.monthlyAlarmRequests);

    const data = { populationServed, monthly911Calls, monthlyAlarmRequests };

    const validationErrors = validateInputs(data);
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return null;
    }

    if (monthlyAlarmRequests == null || monthlyAlarmRequests <= 0) {
      monthlyAlarmRequests = Math.round(monthly911Calls * 0.1);
    }

    const { upfront: upfrontCost, recurring: recurringCost } = lookupCosts(populationServed);

    const transitionedRequests = monthlyAlarmRequests * DEFAULTS.asapTransitionPct;

    // Calc sheet mapping:
    // G11 hold per call, G12 initial processing, G13 callbacks after first call
    // G14 time per first callback (dispatch-relevant), G17 time per second callback (post-incident debrief)
    const g11 = DEFAULTS.holdMinutesPerCall;
    const g12 = DEFAULTS.initialProcessingMinutes;
    const g13 = DEFAULTS.numCallbacksAfterFirst;
    const g14 = DEFAULTS.timePerFirstCallbackMinutes;
    const g17 = DEFAULTS.timePerSecondCallbackMinutes;

    // G15: time needed to dispatch if phone-based (minutes)
    const g15 = (g11 + g12) + (g11 + g14);

    // G18: ECC telecommunicator time needed per alarm request (minutes)
    const g18 = g12 + g14 + g17;

    const asapMin = DEFAULTS.asapProcessingMinutes;

    // G39: reduction in time needed to dispatch an alarm request (minutes)
    const minutesDispatchSaved = g15 - asapMin;

    // Outputs sheet expects “Telecommunicator Time Saved/Incident”.
    // Calc sheet “ECC telecommunicator time needed per alarm request” includes post-dispatch debrief.
    const minutesTcTimeSaved = g18 - asapMin;

    // G23: monthly reallocated telecommunicator time (minutes)
    const monthlyReallocatedMinutes = transitionedRequests * g18;

    // G21: Hours per month
    const monthlyReallocatedHours = monthlyReallocatedMinutes / 60;

    const hourlyRate = DEFAULTS.annualCompensation / 2080;
    const monthlyValue = monthlyReallocatedHours * hourlyRate;
    const annualValue = monthlyValue * 12;

    let roi;
    if (upfrontCost === 0) {
      roi = null;
    } else {
      roi =
        ((annualValue - recurringCost) / Math.abs(upfrontCost) + DEFAULTS.colaPercent) * 100;
    }

    const payback = computePaybackMonths(upfrontCost, recurringCost, monthlyValue);

    return {
      minutesDispatchSaved,
      minutesTcTimeSaved,
      monthlyReallocatedHours,
      monthlyValue,
      annualValue,
      roi,
      payback
    };
  }

  function updateUI(result) {
    if (!result) return;

    setOutput(
      OUTPUTS.minutesDispatchSaved,
      result.minutesDispatchSaved,
      (v) => (v == null || isNaN(v) ? '0' : formatNumber(v, 1))
    );
    setOutput(
      OUTPUTS.tcTimeSaved,
      result.minutesTcTimeSaved,
      (v) => (v == null || isNaN(v) ? '0' : formatNumber(v, 1))
    );
    setOutput(OUTPUTS.monthlyHoursSaved, result.monthlyReallocatedHours, (v) =>
      formatNumber(v, 1)
    );
    setOutput(OUTPUTS.monthlyValue, result.monthlyValue, formatCurrency);
    setOutput(OUTPUTS.annualValue, result.annualValue, formatCurrency);
    setOutput(OUTPUTS.roi, result.roi, (v) =>
      v == null ? 'N/A' : formatPercent(v)
    );
    setOutput(OUTPUTS.paybackMonths, result.payback.display);
  }

  function runCalculation() {
    const result = calculate();
    if (result) {
      const resultsBand = document.getElementById('results-band');
      if (resultsBand) resultsBand.classList.remove('results-band--hidden');
      updateUI(result);
    }
  }

  function init() {
    const calcBtn = document.getElementById('btn-calculate');
    if (calcBtn) {
      calcBtn.addEventListener('click', runCalculation);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
