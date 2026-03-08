/**
 * Compound Interest Calculator
 * Formula (annual compounding with monthly contributions):
 *
 *   FV = P(1 + r)^n  +  PMT * [ ((1 + r)^n - 1) / r ]
 *
 *   where:
 *     P   = initial principal
 *     r   = annual interest rate (decimal)
 *     n   = number of years
 *     PMT = annual equivalent of monthly contributions (PMT_monthly * 12)
 *
 * We also sum total contributions separately so we can split the bar chart
 * into: principal | contributions | interest.
 */

function calculate() {
  // --- Read inputs ---
  const P   = parseFloat(document.getElementById('initial').value)  || 0;
  const pmt = parseFloat(document.getElementById('monthly').value)  || 0;
  const rPct= parseFloat(document.getElementById('rate').value);
  const n   = parseFloat(document.getElementById('years').value);

  // --- Validate ---
  if (isNaN(rPct) || isNaN(n) || n <= 0) {
    shake(document.getElementById('calcBtn'));
    return;
  }

  const r            = rPct / 100;
  const annualPmt    = pmt * 12;
  const totalContrib = annualPmt * n;   // total monthly contributions over all years

  let finalValue;

  if (r === 0) {
    // Edge case: 0% interest
    finalValue = P + totalContrib;
  } else {
    const growth = Math.pow(1 + r, n);
    // Principal grows to: P * (1+r)^n
    // Contributions grow to: PMT_annual * [(1+r)^n - 1] / r
    finalValue = P * growth + annualPmt * ((growth - 1) / r);
  }

  const totalInvested = P + totalContrib;
  const totalInterest = finalValue - totalInvested;

  // --- Render ---
  document.getElementById('totalInvested').textContent = fmt(totalInvested);
  document.getElementById('totalInterest').textContent = fmt(Math.max(0, totalInterest));
  document.getElementById('finalValue').textContent    = fmt(finalValue);

  // Show results
  const placeholder  = document.getElementById('placeholder');
  const resultsGrid  = document.getElementById('resultsGrid');
  const breakdown    = document.getElementById('breakdown');

  placeholder.style.display = 'none';
  resultsGrid.hidden         = false;
  breakdown.hidden           = false;

  // Animate result cards
  document.querySelectorAll('.result-card').forEach((el, i) => {
    el.style.animation = 'none';
    el.offsetHeight;  // reflow
    el.style.animation = `fadeUp 0.5s ${i * 0.07}s ease both`;
  });

  // Bar chart — proportions of final value
  const total = finalValue > 0 ? finalValue : 1;
  const pctPrincipal     = Math.max(0, (P / total) * 100);
  const pctContributions = Math.max(0, (totalContrib / total) * 100);
  const pctInterest      = Math.max(0, 100 - pctPrincipal - pctContributions);

  // Small delay so CSS transition fires after display:none removal
  setTimeout(() => {
    document.getElementById('segPrincipal').style.width     = pctPrincipal.toFixed(1) + '%';
    document.getElementById('segContributions').style.width = pctContributions.toFixed(1) + '%';
    document.getElementById('segInterest').style.width      = pctInterest.toFixed(1) + '%';
  }, 50);
}

/** Format a number as currency */
function fmt(value) {
  if (isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Shake an element for invalid input feedback */
function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
}

// Inject shake keyframes once
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/** Reset the calculator: clear inputs and hide results */
function resetCalc() {
  document.querySelectorAll('.field-grid input, .field-grid select').forEach(el => { el.value = ''; });
  const placeholder = document.getElementById('placeholder');
  const resultsGrid = document.getElementById('resultsGrid');
  const breakdown   = document.getElementById('breakdown');
  if (placeholder) placeholder.style.display = '';
  if (resultsGrid) resultsGrid.hidden = true;
  if (breakdown)   breakdown.hidden   = true;
  document.querySelectorAll('.result-value').forEach(el => { el.textContent = '—'; });
  ['segPrincipal','segContributions','segInterest'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.style.width = '0%';
  });
}

// Allow pressing Enter in any input to trigger calculation
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculate();
  });
});
