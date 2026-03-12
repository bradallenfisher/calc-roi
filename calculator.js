/**
 * ASAP ECC ROI Calculator
 * Matches Excel logic from ASAP ECC ROI Calculator 20260130 JS.xlsx
 */

(function () {
  'use strict';

  // Input field IDs
  const INPUTS = {
    monthlyAlarmRequests: 'monthlyAlarmRequests',
    asapTransitionPct: 'asapTransitionPct',
    monthly911Calls: 'monthly911Calls',
    holdTime: 'holdTime',
    numCallbacks: 'numCallbacks',
    callbackTime: 'callbackTime',
    processingTime: 'processingTime',
    asapProcessingTime: 'asapProcessingTime',
    annualCompensation: 'annualCompensation',
    upfrontCost: 'upfrontCost',
    recurringCost: 'recurringCost',
    colaPercent: 'colaPercent'
  };

  // Output element IDs
  const OUTPUTS = {
    annualValue: 'annual-value',
    roi: 'roi',
    recurringCostDisplay: 'recurring-cost',
    upfrontCostDisplay: 'upfront-cost-display',
    paybackPeriod: 'payback-period',
    monthlyReallocated: 'monthly-reallocated',
    annualReallocated: 'annual-reallocated',
    secondsSaved911: 'seconds-saved-911',
    secondsSavedAlarm: 'seconds-saved-alarm',
    annualHoursSaved: 'annual-hours-saved'
  };

  function getInput(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const val = parseFloat(el.value);
    return isNaN(val) ? null : val;
  }

  function setOutput(id, value, formatter) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = formatter ? formatter(value) : String(value);
  }

  function formatCurrency(value) {
    if (value == null || isNaN(value)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value) {
    if (value == null || isNaN(value)) return '—';
    return value.toFixed(1) + '%';
  }

  function formatNumber(value, decimals) {
    if (value == null || isNaN(value)) return '—';
    return value.toFixed(decimals ?? 2);
  }

  function validateInputs(data) {
    const errors = [];
    if (data.monthlyAlarmRequests != null && data.monthlyAlarmRequests < 0) {
      errors.push('Monthly alarm requests cannot be negative');
    }
    if (data.asapTransitionPct != null && (data.asapTransitionPct < 0 || data.asapTransitionPct > 100)) {
      errors.push('Transition percent must be between 0 and 100');
    }
    if (data.monthly911Calls != null && data.monthly911Calls <= 0) {
      errors.push('Monthly 911 calls must be positive');
    }
    return errors;
  }

  function calculate() {
    const data = {};
    for (const [key, id] of Object.entries(INPUTS)) {
      data[key] = getInput(id);
    }

    const validationErrors = validateInputs(data);
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return null;
    }

    const asapTransitionPctDecimal = (data.asapTransitionPct ?? 100) / 100;

    // 5.1 Derived Values
    const transitionedRequests = (data.monthlyAlarmRequests ?? 1000) * asapTransitionPctDecimal;

    // 5.2 Time Calculations
    const holdTime = data.holdTime ?? 0;
    const numCallbacks = data.numCallbacks ?? 2;
    const callbackTime = data.callbackTime ?? 90;
    const processingTime = data.processingTime ?? 120;
    const asapProcessingTime = data.asapProcessingTime ?? 45;

    const currentDispatchTime = holdTime + (numCallbacks * callbackTime) + processingTime;
    const secondsSavedPerAlarm = currentDispatchTime - asapProcessingTime;

    // IMPORTANT: Spreadsheet excludes hold time
    const monthlyReallocatedHours =
      (transitionedRequests * ((numCallbacks * callbackTime) + processingTime)) / 3600;

    const annualReallocatedHours = monthlyReallocatedHours * 12;

    const monthly911Calls = data.monthly911Calls ?? 10000;
    const secondsSavedPer911Call =
      monthly911Calls > 0 ? (annualReallocatedHours * 3600) / monthly911Calls : 0;

    const annualHoursSavedFromAlarmProcessing = (transitionedRequests * secondsSavedPerAlarm * 12) / 3600;

    // 5.3 Labor Cost Calculations
    const annualCompensation = data.annualCompensation ?? 75000;
    const hourlyRate = annualCompensation / 2080;
    const monthlyValue = monthlyReallocatedHours * hourlyRate;
    const annualValue = monthlyValue * 12;

    const recurringCost = data.recurringCost ?? 0;
    const upfrontCost = data.upfrontCost ?? 0;

    // 5.4 ROI Calculation (match Excel exactly)
    let roi;
    if (upfrontCost === 0) {
      roi = null; // N/A
    } else {
      roi = ((annualValue - recurringCost) / Math.abs(upfrontCost) + (data.colaPercent ?? 0) / 100) * 100;
    }

    // Payback period
    const netAnnual = annualValue - recurringCost;
    const paybackPeriod = netAnnual > 0 ? upfrontCost / netAnnual : null;

    return {
      annualValue,
      recurringCost,
      upfrontCost,
      roi,
      paybackPeriod,
      monthlyReallocatedHours,
      annualReallocatedHours,
      secondsSavedPer911Call,
      secondsSavedPerAlarm,
      annualHoursSavedFromAlarmProcessing
    };
  }

  function updateUI(result) {
    if (!result) return;

    setOutput(OUTPUTS.annualValue, result.annualValue, formatCurrency);
    setOutput(OUTPUTS.roi, result.roi, (v) => (v == null ? 'N/A' : formatPercent(v)));
    setOutput(OUTPUTS.recurringCostDisplay, result.recurringCost, formatCurrency);
    setOutput(OUTPUTS.upfrontCostDisplay, result.upfrontCost, formatCurrency);
    setOutput(
      OUTPUTS.paybackPeriod,
      result.paybackPeriod,
      (v) => (v == null || v <= 0 ? '—' : v.toFixed(1) + ' years')
    );

    setOutput(OUTPUTS.monthlyReallocated, result.monthlyReallocatedHours, formatNumber);
    setOutput(OUTPUTS.annualReallocated, result.annualReallocatedHours, formatNumber);
    setOutput(
      OUTPUTS.secondsSaved911,
      result.secondsSavedPer911Call,
      (v) => (v == null || isNaN(v) ? '0' : Math.round(v).toString())
    );
    setOutput(
      OUTPUTS.secondsSavedAlarm,
      result.secondsSavedPerAlarm,
      (v) => (v == null || isNaN(v) ? '0' : Math.round(v).toString())
    );
    setOutput(
      OUTPUTS.annualHoursSaved,
      result.annualHoursSavedFromAlarmProcessing,
      formatNumber
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

  // Auto-derive monthly 911 calls from alarm requests * 10 when alarm requests change
  function init911Derivation() {
    const alarmInput = document.getElementById(INPUTS.monthlyAlarmRequests);
    const callsInput = document.getElementById(INPUTS.monthly911Calls);
    if (!alarmInput || !callsInput) return;

    alarmInput.addEventListener('change', () => {
      const alarms = parseFloat(alarmInput.value);
      if (!isNaN(alarms) && callsInput.value === '10000') {
        callsInput.value = Math.round(alarms * 10);
      }
    });
  }

  function init() {
    const calcBtn = document.getElementById('btn-calculate');
    if (calcBtn) {
      calcBtn.addEventListener('click', runCalculation);
    }

    init911Derivation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
