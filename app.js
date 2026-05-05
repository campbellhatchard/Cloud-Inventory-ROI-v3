/* ═══════════════════════════════════════════════════
   Cloud Inventory ROI Builder — app.js
   Validated decision engine build
   Fixes: all value levers calculate, cash-flow display corrected, input audit added
   ═══════════════════════════════════════════════════ */

/* ── Industry benchmark data ── */
const IND = {
  telecom:      { labor:30, shrinkage:45, carrying:20, otif:12, it:65, shrinkRate:2.5, carryRate:28, otifRisk:2.5, label:'Telecommunications' },
  mfg:          { labor:25, shrinkage:40, carrying:18, otif:10, it:60, shrinkRate:2.0, carryRate:25, otifRisk:2.0, label:'Manufacturing' },
  construction: { labor:20, shrinkage:35, carrying:15, otif:8,  it:55, shrinkRate:3.0, carryRate:22, otifRisk:1.5, label:'Engineering & Construction' },
  oil:          { labor:22, shrinkage:38, carrying:17, otif:9,  it:58, shrinkRate:2.8, carryRate:24, otifRisk:2.0, label:'Oil & Gas' },
  mining:       { labor:20, shrinkage:35, carrying:15, otif:8,  it:55, shrinkRate:2.5, carryRate:23, otifRisk:1.5, label:'Minerals & Mining' },
  distribution: { labor:35, shrinkage:50, carrying:22, otif:15, it:70, shrinkRate:1.5, carryRate:30, otifRisk:3.0, label:'Distribution & 3PL' },
  food:         { labor:28, shrinkage:42, carrying:18, otif:12, it:60, shrinkRate:2.2, carryRate:27, otifRisk:2.5, label:'Food & Beverage' },
  retail:       { labor:30, shrinkage:45, carrying:20, otif:13, it:62, shrinkRate:1.8, carryRate:28, otifRisk:2.8, label:'Retail' }
};

/* ── Competitive intelligence data ── */
const COMP = {
  sap: {
    name: 'SAP WM / Extended WH Mgmt',
    cost: '$500K–$2M+ implementation',
    time: '12–24 months to go-live',
    maint: '18–22% annual maintenance of license cost',
    pain: [
      'Complex ABAP configuration requires expensive SAP consultants',
      'High total cost of ownership with continuous customization',
      'Difficult to adapt for mobile and field inventory operations',
      'Upgrade cycles create prolonged operational risk and downtime'
    ],
    adv: [
      'No-code configuration vs. SAP ABAP — no consultants needed',
      'Go-live in weeks, not years',
      'Mobile-first UX built for warehouse and field workers',
      'Fraction of the 3-year TCO vs SAP Extended WH Mgmt',
      'Native Field Inventory module — no SAP equivalent exists'
    ]
  },
  rf: {
    name: 'Legacy RF / Paper-based Processes',
    cost: '$50K–$300K in aging hardware refresh cycles',
    time: 'No real-time visibility — data always lags reality',
    maint: 'High ongoing labor cost for manual reconciliation',
    pain: [
      'Zero real-time inventory visibility across locations',
      'Error-prone manual data entry drives write-offs and rework',
      'Disconnected field operations create costly blind spots',
      'Cannot scale operations without adding significant headcount'
    ],
    adv: [
      'Real-time scan-verified accuracy at every transaction point',
      'Runs on modern mobile devices — no RF gun hardware refresh needed',
      'Cloud-based — eliminates on-premise server infrastructure',
      'Unified platform for warehouse and field in a single solution'
    ]
  },
  oracle: {
    name: 'Oracle WMS',
    cost: '$300K–$1.5M implementation cost',
    time: '9–18 months typical implementation timeline',
    maint: '20%+ annual support and maintenance costs',
    pain: [
      'High implementation and customization cost requires Oracle specialists',
      'Limited mobile-first warehouse execution capabilities',
      'Complex integrations required for non-Oracle ERP environments',
      'Rigid licensing model limits flexibility to scale up or down'
    ],
    adv: [
      'ERP-agnostic API-first integration with any system of record',
      'Up to 10x faster deployment vs Oracle WMS implementations',
      'Lower total cost of ownership across a 3-year period',
      'Field Inventory module fills a gap Oracle WMS cannot address'
    ]
  },
  excel: {
    name: 'Spreadsheets / Manual Processes',
    cost: 'Hidden cost: $80K–$200K/yr in labor inefficiency',
    time: 'Perpetually behind — no real-time visibility possible',
    maint: 'Ongoing rework, reconciliation, and audit overhead',
    pain: [
      'Zero real-time inventory visibility across any location',
      'High error rates and write-offs from manual data entry',
      'No audit trail or compliance documentation capability',
      'Cannot support multi-site, multi-user, or field operations'
    ],
    adv: [
      'Real-time scan-verified accuracy replaces all manual counts',
      'Complete audit trail and traceability built into every transaction',
      'Scales to unlimited sites and users without adding headcount',
      'ROI typically achieved within 6 months of go-live'
    ]
  },
  erp: {
    name: 'ERP-Native Inventory Module',
    cost: 'Included in ERP license but severely capability-limited',
    time: 'Configured but not optimized for warehouse or field ops',
    maint: 'Tied to ERP vendor upgrade cycle and roadmap priorities',
    pain: [
      'Designed for record-keeping, not real-time warehouse execution',
      'Limited mobile scanning and barcode verification capability',
      'No wave management, directed put-away, or LPN tracking',
      'Field and remote site inventory creates blind spots in ERP'
    ],
    adv: [
      'Purpose-built execution layer on top of — not replacing — your ERP',
      'Scan-verified at every transaction: receive, put-away, pick, ship',
      'Field Inventory fills the gap ERP cannot and was not designed to close',
      'API-first design means real-time sync with any ERP system'
    ]
  },
  other: {
    name: 'Other WMS Solution',
    cost: 'Varies — typically $200K–$1M+ implementation',
    time: '12–18 months average implementation timeline',
    maint: '15–20% annual maintenance fee is common',
    pain: [
      'High ongoing customization and professional services cost',
      'Limited flexibility for non-warehouse or field operations',
      'Mobile UX often retrofitted rather than natively designed',
      'Vendor lock-in limits integration options and negotiating leverage'
    ],
    adv: [
      'No-code configuration — adapt to new processes in hours, not months',
      'Single unified platform for warehouse, field, and remote inventory',
      'API-first — integrates with any ERP, system of record, or data platform',
      'Cloud-native SaaS — no on-premise infrastructure or IT burden'
    ]
  }
};

/* ════════════════════════════════════════
   Storage
   ════════════════════════════════════════ */
const STORAGE_KEY = 'ci_roi_v4';

function loadSaved() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; }
  catch (e) { return []; }
}
function persistSaved(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
}

let savedScenarios = loadSaved();

/* ════════════════════════════════════════
   Navigation & UI helpers
   ════════════════════════════════════════ */
function switchTab(name) {
  const names = ['calc','disc','comp','exec','saved'];
  names.forEach(n => {
    const tab = document.getElementById('tab-' + n);
    const nav = document.getElementById('nav-' + n);
    if (tab) tab.classList.toggle('active', n === name);
    if (nav) nav.classList.toggle('active', n === name);
  });
  // sync compSelect with competitor dropdown
  if (name === 'comp') {
    const cv = document.getElementById('competitor').value;
    if (cv) document.getElementById('compSelect').value = cv;
    renderComp();
  }
  if (name === 'exec')  renderExec();
  if (name === 'saved') renderList();
  // close sidebar on mobile
  if (window.innerWidth <= 900) closeSidebar();
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  const open = sb.classList.toggle('open');
  ov.classList.toggle('open', open);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

function toggleAcc(btn) {
  btn.classList.toggle('open');
  const body = btn.nextElementSibling;
  body.classList.toggle('closed');
}

function showToast(msg) {
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function updateSavedBadge() {
  const badge = document.getElementById('savedCount');
  if (badge) badge.textContent = savedScenarios.length;
}

/* ════════════════════════════════════════
   Industry defaults
   ════════════════════════════════════════ */
function applyDefaults() {
  const ind = document.getElementById('industry').value;
  if (!ind) return;
  const d = IND[ind];
  const fields = {
    m_labor: d.labor, m_shrinkage: d.shrinkage, m_carrying: d.carrying,
    m_otif: d.otif, m_it: d.it, m_shrinkRate: d.shrinkRate,
    m_carryRate: d.carryRate, m_otifRisk: d.otifRisk
  };
  Object.entries(fields).forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.value = v; });
  const benches = {
    b_labor: d.labor+'%', b_shrinkage: d.shrinkage+'%', b_carrying: d.carrying+'%',
    b_otif: d.otif+'%', b_it: d.it+'%', b_shrinkRate: d.shrinkRate+'%',
    b_carryRate: d.carryRate+'%', b_otifRisk: d.otifRisk+'%'
  };
  Object.entries(benches).forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.textContent = 'Avg: ' + v; });
  document.getElementById('benchBadge').style.display = 'inline-flex';
  recalc();
}

/* ════════════════════════════════════════
   Discovery → Calculator sync
   ════════════════════════════════════════ */
function syncDisc(discId, calcId) {
  const raw = document.getElementById(discId).value;
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  if (!isNaN(num) && num > 0) document.getElementById(calcId).value = num;
  recalc();
}

/* ════════════════════════════════════════
   Form data
   ════════════════════════════════════════ */
function g(id) { return Math.max(0, parseFloat(document.getElementById(id).value) || 0); }

function getVals() {
  const psvc = g('psvcCost'), hw = g('hwCost'), train = g('trainCost');
  const s = (id, fallback='') => { const el = document.getElementById(id); return el ? el.value : fallback; };
  return {
    name:       s('scenarioName') || 'Unnamed scenario',
    company:    s('companyName')  || 'Prospect',
    rep:        s('repName')      || '',
    industry:   s('industry'),
    competitor: s('competitor') || s('compSelect'),
    revenue:    g('revenue'),
    users:      g('userCount'),
    labor:      g('laborCost'),
    inventory:  g('inventoryValue'),
    itCost:     g('itCost'),
    invest:     g('invest'),
    psvc, hw, train, otc: psvc + hw + train,
    discRate:   g('discRate') / 100,
    mLabor:     g('m_labor')    / 100,
    mShrinkage: g('m_shrinkage') / 100,
    mCarrying:  g('m_carrying')  / 100,
    mOtif:      g('m_otif')      / 100,
    mIt:        g('m_it')        / 100,
    shrinkRate: g('m_shrinkRate') / 100,
    carryRate:  g('m_carryRate')  / 100,
    otifRisk:   g('m_otifRisk')   / 100,
    inventoryAccuracy: g('inventoryAccuracy'),
    cycleCountCoverage: g('cycleCountCoverage'),
    excessInventoryReduction: g('excessInventoryReduction') / 100,
    replenishmentType: s('replenishmentType', 'reactive')
  };
}

/* ════════════════════════════════════════
   Core ROI & NPV engine
   ════════════════════════════════════════ */
function calcROI(v) {
  const laborSav   = v.users     * v.labor     * v.mLabor;
  const shrinkSav  = v.inventory * v.shrinkRate * v.mShrinkage;
  const carrySav   = v.inventory * v.carryRate  * v.mCarrying;
  const otifSav    = v.revenue   * v.otifRisk   * v.mOtif;
  const itSav      = v.itCost    * v.mIt;
  const annualBenefit = laborSav + shrinkSav + carrySav + otifSav + itSav;

  const totalInvestY1 = v.otc + v.invest;
  const netY1         = annualBenefit - totalInvestY1;
  // BUG FIX: guard against divide-by-zero and negative invest
  const roi     = totalInvestY1 > 0 ? (netY1 / totalInvestY1) * 100 : 0;
  // BUG FIX: cap payback display at 60 months; show — if no benefit
  const payback = annualBenefit > 0 ? Math.min((totalInvestY1 / annualBenefit) * 12, 60) : null;

  const dr = Math.max(v.discRate, 0.001); // prevent division by zero
  let npv3 = -v.otc, npv5 = -v.otc;
  const cashflows = [];

  for (let yr = 1; yr <= 5; yr++) {
    const netCF = annualBenefit - v.invest;
    const pv    = netCF / Math.pow(1 + dr, yr);
    if (yr <= 3) npv3 += pv;
    npv5 += pv;
    cashflows.push({
      yr,
      benefit: annualBenefit,
      invest:  v.invest,
      net:     netCF,
      pv, cumPV: 0
    });
  }

  let cum = -v.otc;
  cashflows.forEach(c => { cum += c.pv; c.cumPV = cum; });

  return {
    laborSav, shrinkSav, carrySav, otifSav, itSav,
    annualBenefit, totalInvestY1, netY1, roi, payback,
    npv3, npv5,
    totalCost3: v.otc + v.invest * 3,
    totalCost5: v.otc + v.invest * 5,
    cashflows
  };
}

/* ════════════════════════════════════════
   Formatters
   ════════════════════════════════════════ */
function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const abs = Math.abs(Math.round(n));
  // Show as $XM for millions, $XK for thousands
  if (abs >= 1000000) return (n < 0 ? '-$' : '$') + (abs / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 10000)   return (n < 0 ? '-$' : '$') + Math.round(abs / 1000) + 'K';
  return (n < 0 ? '-$' : '$') + abs.toLocaleString();
}
function fmtFull(n) {
  if (n === null || isNaN(n)) return '—';
  return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
}
function fmtPct(n) { return Math.round(n) + '%'; }
// BUG FIX: was missing 'red' — now returns correct class for all sign states
function rClass(n) {
  if (!n && n !== 0) return 'r-neu';
  if (n > 0)  return 'r-pos';
  if (n < 0)  return 'r-neg';
  return 'r-neu';
}
// For livebar color
function lbClass(n) { return n >= 0 ? 'pos' : 'neg'; }

/* Decision-grade extensions: range modelling, diagnostics, validation, methodology */
function calcScenario(v, factor) {
  const vv = {...v,
    mLabor: v.mLabor * factor,
    mShrinkage: v.mShrinkage * factor,
    mCarrying: v.mCarrying * factor,
    mOtif: v.mOtif * factor,
    mIt: v.mIt * factor
  };
  return calcROI(vv);
}
function getScenarioRange(v) {
  return {
    conservative: calcScenario(v, 0.70),
    expected: calcScenario(v, 1.00),
    aggressive: calcScenario(v, 1.25)
  };
}
function topDriver(r) {
  const drivers = [
    ['labor productivity', r.laborSav],
    ['inventory shrinkage / write-offs', r.shrinkSav],
    ['carrying cost and working capital drag', r.carrySav],
    ['OTIF / order accuracy leakage', r.otifSav],
    ['legacy IT displacement', r.itSav]
  ].sort((a,b)=>b[1]-a[1]);
  return drivers[0];
}
function diagnosticNarrative(v, r) {
  const [driver, val] = topDriver(r);
  const ind = v.industry && IND[v.industry] ? IND[v.industry].label : 'the selected operating model';
  if (r.annualBenefit <= 0) return 'Insufficient input data to form a credible diagnostic. Add revenue, inventory value, users, current IT cost, and investment assumptions before sharing this externally.';
  return `Based on the current inputs, the strongest value hypothesis is ${driver}, representing ${fmtFull(val)} of annual value. For ${ind}, this points to a current-state operating issue where inventory execution is creating measurable cost, service, or cash-flow drag. Validate this with operational evidence before using the output as a business case.`;
}
function validationWarnings(v, r) {
  const w = [];
  if (!v.revenue) w.push('Annual revenue is missing; OTIF value-at-risk will be understated.');
  if (!v.inventory) w.push('Inventory value is missing; shrinkage and carrying cost benefits will be understated.');
  if (!v.users) w.push('Inventory users are missing; labor productivity benefit will be understated.');
  if (!v.invest) w.push('Annual subscription/investment is missing; ROI and payback will be artificially high.');
  if (v.inventory && v.revenue && v.inventory > v.revenue) w.push('Inventory value exceeds annual revenue. That may be valid, but finance will challenge it.');
  if (v.mLabor > .40) w.push('Labor productivity improvement exceeds 40%. Treat as aggressive unless validated by time-study evidence.');
  if (v.shrinkRate > .05) w.push('Shrinkage baseline exceeds 5%. Add supporting write-off or cycle-count evidence.');
  if (v.otifRisk > .04) w.push('OTIF value-at-risk exceeds 4% of revenue. Add penalty, expedite, churn, or margin-loss evidence.');
  if (r.payback !== null && r.payback < 3) w.push('Payback is under 3 months. That may be possible, but it will be challenged without hard proof.');
  return w;
}
function confidenceLabel(v, r) {
  let score = 0;
  ['revenue','inventory','users','labor','itCost','invest'].forEach(k => { if (v[k] > 0) score++; });
  if (validationWarnings(v,r).length === 0) score += 2;
  if (score >= 7) return ['High', 'Evidence appears complete enough for executive review.'];
  if (score >= 5) return ['Moderate', 'Usable for discovery follow-up, but finance validation is still required.'];
  return ['Low', 'Directional only. Do not position as a business case yet.'];
}
function renderScenarioBand(v, r) {
  const sc = getScenarioRange(v);
  return `
    <div class="band-row"><span>Conservative</span><strong>${fmtFull(sc.conservative.annualBenefit)}</strong><em>${fmtFull(sc.conservative.npv3)} 3-yr NPV</em></div>
    <div class="band-row primary"><span>Expected</span><strong>${fmtFull(sc.expected.annualBenefit)}</strong><em>${fmtFull(sc.expected.npv3)} 3-yr NPV</em></div>
    <div class="band-row"><span>Aggressive</span><strong>${fmtFull(sc.aggressive.annualBenefit)}</strong><em>${fmtFull(sc.aggressive.npv3)} 3-yr NPV</em></div>
    <p class="panel-note">Range uses 70%, 100%, and 125% of the selected improvement assumptions. This prevents the model from looking like single-point fantasy math.</p>`;
}
function renderValidationPanel(v, r) {
  const [conf, note] = confidenceLabel(v,r);
  const warnings = validationWarnings(v,r);
  const cls = conf === 'High' ? 'ok' : conf === 'Moderate' ? 'warn' : 'bad';
  return `<div class="confidence ${cls}"><strong>${conf} confidence</strong><span>${note}</span></div>` +
    (warnings.length ? `<ul class="warning-list">${warnings.map(x=>`<li>${x}</li>`).join('')}</ul>` : '<div class="clean-list">No material validation warnings detected.</div>');
}

function calcLossExposure(v, r) {
  const visible = r.annualBenefit;
  const inventoryDistortion = v.inventory * Math.max(0, (100 - v.inventoryAccuracy) / 100) * 0.18;
  const processDrag = v.users * v.labor * Math.max(v.mLabor * 0.75, 0.08);
  const serviceLeakage = v.revenue * v.otifRisk * Math.max(v.mOtif, 0.05);
  const workingCapitalDrag = v.inventory * v.carryRate * Math.max(v.mCarrying, 0.08);
  const total = Math.max(visible, inventoryDistortion + processDrag + serviceLeakage + workingCapitalDrag);
  return { inventoryDistortion, processDrag, serviceLeakage, workingCapitalDrag, total };
}
function workingCapitalRelease(v) {
  const low = v.inventory * Math.max(v.excessInventoryReduction * 0.75, 0);
  const high = v.inventory * Math.max(v.excessInventoryReduction * 1.25, 0);
  return { low, high };
}
function doNothingProjection(v, loss) {
  const inflation = 0.10;
  const y1 = loss.total, y2 = y1 * (1 + inflation), y3 = y2 * (1 + inflation);
  return { y1, y2, y3, total: y1 + y2 + y3 };
}
function benchmarkRows(v) {
  const accGap = Math.max(0, 96 - v.inventoryAccuracy);
  const ccGap = Math.max(0, 70 - v.cycleCountCoverage);
  const rep = v.replenishmentType === 'planned' ? 'On track' : v.replenishmentType === 'mixed' ? 'Partially controlled' : 'Reactive risk';
  return [
    ['Inventory accuracy', (v.inventoryAccuracy || 0).toFixed(1) + '%', '95–98%', accGap > 0 ? accGap.toFixed(1) + ' pt gap' : 'At/near target'],
    ['Cycle-count coverage', Math.round(v.cycleCountCoverage || 0) + '%', '70%+', ccGap > 0 ? ccGap.toFixed(0) + ' pt gap' : 'At/near target'],
    ['Replenishment discipline', rep, 'Planned / exception-led', v.replenishmentType === 'reactive' ? 'Urgency driver' : 'Validate maturity']
  ];
}
function diagnosticDrivers(v, r) {
  const d=[];
  if (v.inventoryAccuracy && v.inventoryAccuracy < 90) d.push('System inventory is not trusted enough for execution-grade decisioning. Expect rework, expedites, manual checks, and write-offs.');
  if (v.cycleCountCoverage && v.cycleCountCoverage < 40) d.push('Cycle-count coverage is too light to prevent distortion from accumulating between physical counts.');
  if (v.replenishmentType === 'reactive') d.push('Reactive replenishment means shortages are being discovered late, after labor and service impact are already active.');
  if (r.laborSav === topDriver(r)[1]) d.push('Labor is the dominant value driver, so the operational proof should focus on touches, walking, searching, rework, and reconciliation time.');
  if (!d.length) d.push('The profile looks controlled. The value case should shift from crisis framing to throughput, scalability, auditability, and growth enablement.');
  return d;
}
function renderLossExposurePanel(v, r) {
  const x=calcLossExposure(v,r); const wc=workingCapitalRelease(v);
  return `<div class="loss-hero"><span>Estimated annual hidden exposure</span><strong>${fmtFull(x.total)}</strong></div>
  <div class="loss-breakdown">
    <div><span>Inventory distortion</span><strong>${fmtFull(x.inventoryDistortion)}</strong></div>
    <div><span>Process/labor drag</span><strong>${fmtFull(x.processDrag)}</strong></div>
    <div><span>Service leakage</span><strong>${fmtFull(x.serviceLeakage)}</strong></div>
    <div><span>Working-capital drag</span><strong>${fmtFull(x.workingCapitalDrag)}</strong></div>
  </div>
  <div class="cash-release"><span>Potential working capital release</span><strong>${fmtFull(wc.low)} – ${fmtFull(wc.high)}</strong></div>`;
}
function renderDiagnosticPanel(v, r) {
  return `<ul class="diagnostic-list">${diagnosticDrivers(v,r).map(x=>`<li>${x}</li>`).join('')}</ul>`;
}
function renderInactionPanel(v, r) {
  const p=doNothingProjection(v, calcLossExposure(v,r));
  return `<div class="inaction-total"><span>3-year avoidable loss</span><strong>${fmtFull(p.total)}</strong></div>
  <div class="mini-table"><div><span>Year 1</span><b>${fmtFull(p.y1)}</b></div><div><span>Year 2</span><b>${fmtFull(p.y2)}</b></div><div><span>Year 3</span><b>${fmtFull(p.y3)}</b></div></div>`;
}
function renderBenchmarkGapPanel(v) {
  return `<div class="bench-table">${benchmarkRows(v).map(row=>`<div><span>${row[0]}</span><b>${row[1]}</b><em>${row[2]}</em><strong>${row[3]}</strong></div>`).join('')}</div>`;
}

function renderValueDriverAudit(v, r) {
  const rows = [
    {
      driver: 'Labor productivity',
      formula: `${v.users.toLocaleString()} users × ${fmtFull(v.labor)} loaded cost × ${(v.mLabor*100).toFixed(1)}% improvement`,
      annual: r.laborSav,
      status: v.users && v.labor && v.mLabor ? 'Calculated' : 'Needs users, labor cost, and labor improvement'
    },
    {
      driver: 'Shrinkage / write-offs',
      formula: `${fmtFull(v.inventory)} inventory × ${(v.shrinkRate*100).toFixed(1)}% shrinkage × ${(v.mShrinkage*100).toFixed(1)}% reduction`,
      annual: r.shrinkSav,
      status: v.inventory && v.shrinkRate && v.mShrinkage ? 'Calculated' : 'Needs inventory value, shrinkage rate, and reduction assumption'
    },
    {
      driver: 'Carrying cost',
      formula: `${fmtFull(v.inventory)} inventory × ${(v.carryRate*100).toFixed(1)}% carrying cost × ${(v.mCarrying*100).toFixed(1)}% reduction`,
      annual: r.carrySav,
      status: v.inventory && v.carryRate && v.mCarrying ? 'Calculated' : 'Needs inventory value, carrying cost rate, and reduction assumption'
    },
    {
      driver: 'OTIF / service leakage',
      formula: `${fmtFull(v.revenue)} revenue × ${(v.otifRisk*100).toFixed(1)}% value at risk × ${(v.mOtif*100).toFixed(1)}% improvement`,
      annual: r.otifSav,
      status: v.revenue && v.otifRisk && v.mOtif ? 'Calculated' : 'Needs revenue, OTIF risk, and OTIF improvement'
    },
    {
      driver: 'IT displacement',
      formula: `${fmtFull(v.itCost)} current IT cost × ${(v.mIt*100).toFixed(1)}% displacement`,
      annual: r.itSav,
      status: v.itCost && v.mIt ? 'Calculated' : 'Needs current IT cost and displacement assumption'
    },
    {
      driver: 'Working capital release',
      formula: `${fmtFull(v.inventory)} inventory × ${(v.excessInventoryReduction*100).toFixed(1)}% excess inventory reduction`,
      annual: workingCapitalRelease(v).low,
      status: v.inventory && v.excessInventoryReduction ? 'Calculated as cash-release range, not annual P&L benefit' : 'Needs inventory value and excess inventory reduction assumption'
    }
  ];
  return `<div class="audit-table">${rows.map(row => `<div class="audit-row ${row.annual > 0 ? 'active' : 'inactive'}"><span>${row.driver}</span><b>${fmtFull(row.annual)}</b><em>${row.formula}</em><strong>${row.status}</strong></div>`).join('')}</div>`;
}

function renderMethodology(v, r) {
  return `
    <div class="method-grid">
      <div><strong>Labor</strong><span>Users × loaded labor cost × productivity improvement</span></div>
      <div><strong>Shrinkage</strong><span>Inventory value × baseline shrinkage rate × reduction assumption</span></div>
      <div><strong>Carrying cost</strong><span>Inventory value × carrying cost rate × reduction assumption</span></div>
      <div><strong>OTIF / service leakage</strong><span>Revenue × value-at-risk rate × improvement assumption</span></div>
      <div><strong>IT displacement</strong><span>Current annual IT cost × displacement assumption</span></div>
      <div><strong>NPV</strong><span>Recurring net cash flow discounted at ${fmtPct(v.discRate*100)}; one-time costs treated as year-0 outflow</span></div>
    </div>`;
}


/* ════════════════════════════════════════
   Recalculate — updates livebar + grid
   ════════════════════════════════════════ */
function recalc() {
  const v = getVals();
  const r = calcROI(v);

  // Update OTC total
  document.getElementById('totalOTC').textContent = fmtFull(v.otc);

  // BUG FIX: update live bar with correct color classes
  const lb = (id, val, cls) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.className = 'lb-value ' + cls;
  };
  lb('lb-benefit', fmt(r.annualBenefit), lbClass(r.annualBenefit));
  lb('lb-roi',     r.roi ? fmtPct(r.roi) : '—', lbClass(r.roi));
  lb('lb-npv3',    fmt(r.npv3), lbClass(r.npv3));
  lb('lb-npv5',    fmt(r.npv5), lbClass(r.npv5));

  // BUG FIX: payback display — cap, null-safe
  const paybackStr = r.payback === null ? '—' :
    r.payback >= 60 ? '60+ mo' : r.payback.toFixed(1) + ' mo';

  document.getElementById('roiGrid').innerHTML = `
    <div class="result-card r-hero">
      <div class="r-label">Annual benefit</div>
      <div class="r-value">${fmtFull(r.annualBenefit)}</div>
    </div>
    <div class="result-card ${rClass(r.netY1)}">
      <div class="r-label">Net benefit year 1</div>
      <div class="r-value">${fmtFull(r.netY1)}</div>
    </div>
    <div class="result-card r-blue">
      <div class="r-label">Year 1 ROI</div>
      <div class="r-value">${fmtPct(r.roi)}</div>
    </div>
    <div class="result-card r-neu">
      <div class="r-label">Payback period</div>
      <div class="r-value">${paybackStr}</div>
    </div>
    <div class="result-card ${rClass(r.npv3)}">
      <div class="r-label">3-yr NPV (${fmtPct(v.discRate*100)})</div>
      <div class="r-value">${fmtFull(r.npv3)}</div>
    </div>
    <div class="result-card ${rClass(r.npv5)}">
      <div class="r-label">5-yr NPV (${fmtPct(v.discRate*100)})</div>
      <div class="r-value">${fmtFull(r.npv5)}</div>
    </div>
    <div class="result-card r-neu">
      <div class="r-label">Total one-time cost</div>
      <div class="r-value">${fmtFull(v.otc)}</div>
    </div>
    <div class="result-card r-neu">
      <div class="r-label">3-yr total investment</div>
      <div class="r-value">${fmtFull(r.totalCost3)}</div>
    </div>
    <div class="result-card r-pos">
      <div class="r-label">3-yr gross benefit</div>
      <div class="r-value">${fmtFull(r.annualBenefit * 3)}</div>
    </div>
    <div class="result-card r-pos">
      <div class="r-label">5-yr gross benefit</div>
      <div class="r-value">${fmtFull(r.annualBenefit * 5)}</div>
    </div>
  `;

  const scenarioBand = document.getElementById('scenarioBand');
  if (scenarioBand) scenarioBand.innerHTML = renderScenarioBand(v, r);
  const validationPanel = document.getElementById('validationPanel');
  if (validationPanel) validationPanel.innerHTML = renderValidationPanel(v, r);
  const methodologyPanel = document.getElementById('methodologyPanel');
  if (methodologyPanel) methodologyPanel.innerHTML = renderMethodology(v, r);
  const valueAuditPanel = document.getElementById('valueAuditPanel');
  if (valueAuditPanel) valueAuditPanel.innerHTML = renderValueDriverAudit(v, r);
  const lossPanel = document.getElementById('lossExposurePanel');
  if (lossPanel) lossPanel.innerHTML = renderLossExposurePanel(v, r);
  const diagnosticPanel = document.getElementById('diagnosticPanel');
  if (diagnosticPanel) diagnosticPanel.innerHTML = renderDiagnosticPanel(v, r);
  const inactionPanel = document.getElementById('inactionPanel');
  if (inactionPanel) inactionPanel.innerHTML = renderInactionPanel(v, r);
  const benchmarkGapPanel = document.getElementById('benchmarkGapPanel');
  if (benchmarkGapPanel) benchmarkGapPanel.innerHTML = renderBenchmarkGapPanel(v);
}

/* ════════════════════════════════════════
   Competitive tab
   ════════════════════════════════════════ */
function renderComp() {
  // BUG FIX: sync both dropdowns
  const key = document.getElementById('compSelect').value || document.getElementById('competitor').value;
  const el = document.getElementById('compContent');
  if (!key) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg width="22" height="22" viewBox="0 0 16 16" fill="none"><path d="M8 1l2 4 4.5.65-3.25 3.17.77 4.48L8 11.1l-4.02 2.2.77-4.48L1.5 5.65 6 5z" stroke="#94A3B8" stroke-width="1.4" stroke-linejoin="round"/></svg></div><p>Select a competing solution above.</p></div>`;
    return;
  }
  const c = COMP[key];
  // also sync calc tab dropdown if coming from comp tab
  if (document.getElementById('competitor').value !== key) {
    document.getElementById('competitor').value = key;
  }
  el.innerHTML = `
    <div class="comp-header-card">
      <div class="comp-header-name">${c.name}</div>
      <div class="comp-meta-row">
        <div class="comp-meta-item"><div class="cm-label">Typical cost</div><div class="cm-value">${c.cost}</div></div>
        <div class="comp-meta-item"><div class="cm-label">Time to value</div><div class="cm-value">${c.time}</div></div>
        <div class="comp-meta-item"><div class="cm-label">Ongoing maintenance</div><div class="cm-value">${c.maint}</div></div>
      </div>
    </div>
    <div class="comp-two">
      <div class="comp-list-card pain">
        <div class="comp-list-title">Pain points with ${c.name}</div>
        ${c.pain.map(p => `<div class="comp-row"><i class="comp-icon">✗</i><span>${p}</span></div>`).join('')}
      </div>
      <div class="comp-list-card adv">
        <div class="comp-list-title">Cloud Inventory advantages</div>
        ${c.adv.map(a => `<div class="comp-row"><i class="comp-icon">✓</i><span>${a}</span></div>`).join('')}
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════
   Executive presentation render
   ════════════════════════════════════════ */
function renderExec() {
  const v = getVals();
  const r = calcROI(v);
  const loss = calcLossExposure(v,r);
  const wc = workingCapitalRelease(v);
  const inactive = doNothingProjection(v, loss);
  const sc = getScenarioRange(v);
  const indLabel = v.industry && IND[v.industry] ? IND[v.industry].label : '—';
  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const compKey = v.competitor;
  const comp = compKey ? COMP[compKey] : null;
  const paybackStr = r.payback === null ? '—' : r.payback >= 60 ? '60+ mo' : r.payback.toFixed(1) + ' mo';
  const valueRows = [
    ['Labor & productivity savings', r.laborSav],
    ['Shrinkage / write-off reduction', r.shrinkSav],
    ['Inventory carrying cost reduction', r.carrySav],
    ['OTIF / order accuracy improvement', r.otifSav],
    ['IT & legacy system displacement', r.itSav]
  ];
  const maxVal = Math.max(...valueRows.map(x=>x[1]), 1);
  const bars = valueRows.map(row => `<div class="e-bar-row"><span class="e-bar-lbl">${row[0]}</span><div class="e-bar-track"><div class="e-bar-fill" style="width:${Math.round((row[1]/maxVal)*100)}%"></div></div><span class="e-bar-val">${fmtFull(row[1])}</span></div>`).join('');
  const cfRows = r.cashflows.map(c => `<tr><td class="left">Year ${c.yr}</td><td>${fmtFull(c.benefit)}</td><td class="neg">(${fmtFull(c.invest)})</td><td class="${c.net >= 0 ? 'pos' : 'neg'}">${fmtFull(c.net)}</td><td>${fmtFull(c.pv)}</td><td class="${c.cumPV >= 0 ? 'pos' : 'neg'}">${fmtFull(c.cumPV)}</td></tr>`).join('');
  const compSection = comp ? `<div class="e-section"><div class="e-h2">Competitive displacement: ${comp.name}</div><table class="e-comp-tbl"><thead><tr><th>Category</th><th>${comp.name}</th><th>Cloud Inventory</th></tr></thead><tbody><tr><td class="left">Investment</td><td>${comp.cost}</td><td>${fmtFull(v.invest)}/yr + ${fmtFull(v.otc)} one-time</td></tr><tr><td class="left">Time to value</td><td>${comp.time}</td><td>Weeks, not months</td></tr><tr><td class="left">Maintenance</td><td>${comp.maint}</td><td>Included in SaaS subscription</td></tr></tbody></table><div class="e-comp-grid"><div><div class="e-comp-col-title bad">Common pain points</div>${comp.pain.map(p => `<div class="e-comp-item"><span class="e-comp-x">✗</span>${p}</div>`).join('')}</div><div><div class="e-comp-col-title good">Cloud Inventory advantages</div>${comp.adv.map(a => `<div class="e-comp-item"><span class="e-comp-check">✓</span>${a}</div>`).join('')}</div></div></div>` : '';
  document.getElementById('execDoc').innerHTML = `
  <div id="execPrintTarget">
    <div class="e-cover"><img class="e-cover-logo" src="ci-logo-negative.png" alt="Cloud Inventory"/><div class="e-tagline">Executive Value Assessment</div><div class="e-company">${v.company || 'Your Company'}</div><div class="e-sub">Cloud Inventory Platform · ${indLabel} · Prepared ${today}${v.rep ? ' · ' + v.rep : ''}</div></div>
    <div class="e-kpis"><div class="e-kpi"><div class="e-kv r">${fmtFull(loss.total)}</div><div class="e-kl">Annual hidden loss exposure</div></div><div class="e-kpi"><div class="e-kv g">${fmtFull(r.annualBenefit)}</div><div class="e-kl">Annual recoverable benefit</div></div><div class="e-kpi"><div class="e-kv b">${paybackStr}</div><div class="e-kl">Payback</div></div><div class="e-kpi"><div class="e-kv ${r.npv3 >= 0 ? 'g' : 'r'}">${fmtFull(r.npv3)}</div><div class="e-kl">3-year NPV</div></div></div>
    <div class="e-body">
      <div class="e-section executive-diagnostic"><div class="e-h2">The executive aha</div><p><strong>${v.company || 'The operation'} appears to be carrying ${fmtFull(loss.total)} in annual hidden operational exposure.</strong> The decision is not whether a calculator shows ROI; the decision is whether leadership is willing to keep funding preventable inventory distortion, labor drag, service leakage, and working-capital waste.</p><div class="e-proof-grid"><div><strong>3-year cost of inaction</strong><span>${fmtFull(inactive.total)}</span></div><div><strong>Working capital release</strong><span>${fmtFull(wc.low)} – ${fmtFull(wc.high)}</span></div><div><strong>Confidence</strong><span>${confidenceLabel(v,r)[0]}</span></div></div></div>
      <div class="e-section"><div class="e-h2">Likely operational drivers</div><ul class="e-bullets">${diagnosticDrivers(v,r).map(x=>`<li>${x}</li>`).join('')}</ul></div>
      <div class="e-section"><div class="e-h2">Benchmark gap</div><table class="e-tbl"><thead><tr><th class="left">Metric</th><th>Current profile</th><th>Target / benchmark</th><th>Interpretation</th></tr></thead><tbody>${benchmarkRows(v).map(row=>`<tr><td class="left">${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join('')}</tbody></table></div>
      <div class="e-section"><div class="e-h2">Scenario sensitivity</div><table class="e-tbl"><thead><tr><th class="left">Scenario</th><th>Annual benefit</th><th>3-year NPV</th><th>5-year NPV</th></tr></thead><tbody><tr><td class="left">Conservative</td><td>${fmtFull(sc.conservative.annualBenefit)}</td><td>${fmtFull(sc.conservative.npv3)}</td><td>${fmtFull(sc.conservative.npv5)}</td></tr><tr><td class="left">Expected</td><td>${fmtFull(sc.expected.annualBenefit)}</td><td>${fmtFull(sc.expected.npv3)}</td><td>${fmtFull(sc.expected.npv5)}</td></tr><tr><td class="left">Aggressive</td><td>${fmtFull(sc.aggressive.annualBenefit)}</td><td>${fmtFull(sc.aggressive.npv3)}</td><td>${fmtFull(sc.aggressive.npv5)}</td></tr></tbody></table><p class="e-footnote">Sensitivity uses 70%, 100%, and 125% of selected improvement assumptions.</p></div>
      <div class="e-section"><div class="e-h2">Annual value by category</div>${bars}<div class="e-bar-total"><span>Total annual value</span><span>${fmtFull(r.annualBenefit)}</span></div></div>
      <div class="e-section"><div class="e-h2">5-year cash flow & NPV</div><table class="e-tbl"><thead><tr><th class="left">Year</th><th>Annual benefit</th><th>Total investment</th><th>Net cash flow</th><th>Present value</th><th>Cumulative NPV</th></tr></thead><tbody><tr class="otc-note"><td class="left">Year 0 — one-time costs</td><td></td><td class="neg">(${fmtFull(v.otc)})</td><td></td><td></td><td></td></tr>${cfRows}</tbody></table></div>
      ${compSection}
      <div class="e-section"><div class="e-h2">Model assurance</div>${renderValidationPanel(v,r)}<div class="e-h2" style="margin-top:18px;">Calculation methodology</div>${renderMethodology(v,r)}</div>
      <div class="e-footer"><img class="e-footer-logo" src="ci-logo-light.jpg" alt="Cloud Inventory"/><span class="e-footer-txt">Analysis uses prospect-supplied inputs and configurable assumptions. Validate with operational and financial evidence before approval. · cloudinventory.com</span></div>
    </div>
  </div>`;
}

/* ════════════════════════════════════════
   Save / Load / Delete scenarios
   ════════════════════════════════════════ */
function saveScenario() {
  const v = getVals();
  const r = calcROI(v);
  // Prevent saving completely empty scenarios
  if (!v.revenue && !v.inventory && !v.users) {
    showToast('Add some inputs before saving.');
    return;
  }
  savedScenarios.unshift({
    id: Date.now(),
    name: v.name, company: v.company, industry: v.industry,
    date: new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}),
    annualBenefit: r.annualBenefit, roi: r.roi,
    npv3: r.npv3, npv5: r.npv5, payback: r.payback,
    inputs: v
  });
  persistSaved(savedScenarios);
  updateSavedBadge();
  renderList();
  showToast('Scenario saved — "' + v.name + '"');
}

function loadScenario(id) {
  const s = savedScenarios.find(x => x.id === id);
  if (!s) return;
  const i = s.inputs;
  const set = (id2, val) => { const el = document.getElementById(id2); if (el) el.value = val ?? ''; };
  set('scenarioName', i.name);  set('companyName', i.company);
  set('repName', i.rep);        set('industry', i.industry);
  set('competitor', i.competitor || '');
  set('revenue', i.revenue);    set('userCount', i.users);
  set('laborCost', i.labor);    set('inventoryValue', i.inventory);
  set('itCost', i.itCost);      set('invest', i.invest);
  set('psvcCost', i.psvc);      set('hwCost', i.hw);
  set('trainCost', i.train);    set('discRate', Math.round(i.discRate * 100));
  set('m_labor',    Math.round(i.mLabor    * 100));
  set('m_shrinkage',Math.round(i.mShrinkage* 100));
  set('m_carrying', Math.round(i.mCarrying * 100));
  set('m_otif',     Math.round(i.mOtif     * 100));
  set('m_it',       Math.round(i.mIt       * 100));
  set('m_shrinkRate',(i.shrinkRate * 100).toFixed(1));
  set('m_carryRate', Math.round(i.carryRate * 100));
  set('m_otifRisk',  (i.otifRisk  * 100).toFixed(1));
  set('inventoryAccuracy', i.inventoryAccuracy ?? 88);
  set('cycleCountCoverage', i.cycleCountCoverage ?? 25);
  set('excessInventoryReduction', i.excessInventoryReduction ? Math.round(i.excessInventoryReduction * 100) : 12);
  set('replenishmentType', i.replenishmentType || 'reactive');
  if (i.industry && IND[i.industry]) {
    document.getElementById('benchBadge').style.display = 'inline-flex';
  }
  recalc();
  switchTab('calc');
  showToast('Loaded — "' + i.name + '"');
}

function deleteScenario(id) {
  const s = savedScenarios.find(x => x.id === id);
  if (!s) return;
  if (!confirm('Delete "' + s.name + '"?')) return;
  savedScenarios = savedScenarios.filter(x => x.id !== id);
  persistSaved(savedScenarios);
  updateSavedBadge();
  renderList();
  showToast('Scenario deleted.');
}

function renderList() {
  const el = document.getElementById('scenarioList');
  if (!savedScenarios.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg width="22" height="22" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke="#94A3B8" stroke-width="1.4"/><path d="M5 1v5l3-2 3 2V1" stroke="#94A3B8" stroke-width="1.4" stroke-linejoin="round"/></svg></div><p>No scenarios saved yet. Build one in the Calculator.</p></div>`;
    return;
  }

  // Generate initials avatar from company name
  const initials = (name) => name.trim().split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase() || '?';
  const payStr = (pb) => pb === null ? '—' : pb >= 60 ? '60+mo' : pb.toFixed(1)+'mo';

  el.innerHTML = `<ul class="scenario-list">${savedScenarios.map(s => `
    <li class="scenario-item">
      <div class="scenario-avatar">${initials(s.company || s.name)}</div>
      <div class="scenario-info">
        <div class="scenario-name">${s.name}</div>
        <div class="scenario-meta">${s.company}${s.industry && IND[s.industry] ? ' · ' + IND[s.industry].label : ''} · ${s.date} · Payback: ${payStr(s.payback)}</div>
      </div>
      <div class="scenario-kpis">
        <div class="sk-main">${fmtFull(s.annualBenefit)}/yr · ${fmtPct(s.roi)} ROI</div>
        <div class="sk-sub">NPV3: ${fmtFull(s.npv3)} · NPV5: ${fmtFull(s.npv5)}</div>
      </div>
      <div class="scenario-actions">
        <button class="btn btn-ghost btn-sm" onclick="loadScenario(${s.id})">Load</button>
        <button class="btn btn-danger btn-sm" onclick="deleteScenario(${s.id})">Delete</button>
      </div>
    </li>`).join('')}
  </ul>`;
}

/* ════════════════════════════════════════
   Clear form
   ════════════════════════════════════════ */
function clearForm() {
  const clear = ['scenarioName','companyName','repName','revenue','userCount',
    'inventoryValue','itCost','psvcCost','hwCost','trainCost'];
  clear.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  for (let i = 1; i <= 17; i++) { const el = document.getElementById('dq'+i); if (el) el.value = ''; }
  document.getElementById('industry').value    = '';
  document.getElementById('competitor').value  = '';
  document.getElementById('compSelect').value  = '';
  document.getElementById('laborCost').value   = 55000;
  document.getElementById('invest').value      = 80000;
  document.getElementById('discRate').value    = 10;
  document.getElementById('m_labor').value     = 25;
  document.getElementById('m_shrinkage').value = 40;
  document.getElementById('m_carrying').value  = 15;
  document.getElementById('m_otif').value      = 10;
  document.getElementById('m_it').value        = 60;
  document.getElementById('m_shrinkRate').value= 2;
  document.getElementById('m_carryRate').value = 25;
  document.getElementById('m_otifRisk').value  = 2;
  document.getElementById('inventoryAccuracy').value = 88;
  document.getElementById('cycleCountCoverage').value = 25;
  document.getElementById('excessInventoryReduction').value = 12;
  document.getElementById('replenishmentType').value = 'reactive';
  document.getElementById('benchBadge').style.display = 'none';
  recalc();
  showToast('Form cleared — ready for new scenario.');
}

/* ════════════════════════════════════════
   Init
   ════════════════════════════════════════ */
document.getElementById('todayDate').textContent =
  new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

updateSavedBadge();
renderList();
recalc();


/* Test hook used by tests/roi-engine.spec.js. Safe in browser. */
if (typeof window !== 'undefined') {
  window.__CI_ROI_TEST__ = { calcROI, calcScenario, getScenarioRange, calcLossExposure, workingCapitalRelease, doNothingProjection, validationWarnings, confidenceLabel, benchmarkRows };
}
