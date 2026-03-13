/**
 * ASAP ECC ROI Calculator
 * Based on ROI Cost Categories 20260227 JS.xlsx
 * Formulas from original ASAP ECC ROI Calculator 20260130 JS.xlsx
 */

(function () {
  'use strict';

  // Cost lookup table from ROI Cost Categories 20260227 JS.xlsx
  // Tier 0: pop >= 2.5M, Tier 1: 500K-2.5M, Tier 2: 100K-500K, Tier 3: < 100K
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
    roi: 'roi'
  };

  // Hidden/default values (from assumptions footer)
  const DEFAULTS = {
    asapTransitionPct: 0.75,
    holdTime: 120,
    numCallbacks: 2,
    callbackTime: 60,
    processingTime: 120,
    asapProcessingTime: 20,
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

    // Monthly alarm requests: 10% of 911 calls if not provided
    if (monthlyAlarmRequests == null || monthlyAlarmRequests <= 0) {
      monthlyAlarmRequests = Math.round(monthly911Calls * 0.1);
    }

    const { upfront: upfrontCost, recurring: recurringCost } = lookupCosts(populationServed);

    const transitionedRequests = monthlyAlarmRequests * DEFAULTS.asapTransitionPct;

    const currentDispatchTime =
      DEFAULTS.holdTime +
      DEFAULTS.numCallbacks * DEFAULTS.callbackTime +
      DEFAULTS.processingTime;
    const secondsSavedPerAlarm = currentDispatchTime - DEFAULTS.asapProcessingTime;

    // Monthly reallocated hours (hold time excluded per original spreadsheet)
    const monthlyReallocatedHours =
      (transitionedRequests *
        (DEFAULTS.numCallbacks * DEFAULTS.callbackTime + DEFAULTS.processingTime)) /
      3600;

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

    // Minutes to dispatch saved per incident (Excel: G36/60 = G37)
    const minutesDispatchSaved = secondsSavedPerAlarm / 60;
    const minutesTcTimeSaved = secondsSavedPerAlarm / 60;

    return {
      minutesDispatchSaved,
      minutesTcTimeSaved,
      monthlyReallocatedHours,
      monthlyValue,
      annualValue,
      roi
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
