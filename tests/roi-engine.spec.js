const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const ids = [...new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]))];

function makeEl(id) {
  return {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    style: {},
    nextElementSibling: { classList: { toggle(){} } },
    classList: { add(){}, remove(){}, toggle(){ return false; } },
    appendChild(){},
    setAttribute(){},
    getAttribute(){ return null; }
  };
}
const elements = Object.fromEntries(ids.map(id => [id, makeEl(id)]));
const defaults = {
  laborCost: 55000, invest: 80000, discRate: 10, m_labor: 25, m_shrinkage: 40,
  m_carrying: 15, m_otif: 10, m_it: 60, m_shrinkRate: 2, m_carryRate: 25,
  m_otifRisk: 2, inventoryAccuracy: 88, cycleCountCoverage: 25,
  excessInventoryReduction: 12, replenishmentType: 'reactive'
};
for (const [id, val] of Object.entries(defaults)) if (elements[id]) elements[id].value = String(val);

const document = {
  getElementById(id) { return elements[id] || (elements[id] = makeEl(id)); },
  querySelectorAll() { return []; }
};
const window = { innerWidth: 1200, __CI_ROI_TEST__: null };
const localStorage = { getItem(){ return null; }, setItem(){} };
const context = { window, document, localStorage, console, setTimeout(){}, confirm(){ return true; } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context, { filename: 'app.js' });

const api = context.window.__CI_ROI_TEST__;
if (!api) throw new Error('Test API was not exposed');

const v = {
  name: 'Test', company: 'Acme', rep: 'QA', industry: 'distribution', competitor: 'sap',
  revenue: 50000000, users: 50, labor: 60000, inventory: 10000000, itCost: 250000,
  invest: 120000, psvc: 50000, hw: 25000, train: 15000, otc: 90000, discRate: 0.10,
  mLabor: 0.25, mShrinkage: 0.40, mCarrying: 0.15, mOtif: 0.10, mIt: 0.60,
  shrinkRate: 0.02, carryRate: 0.25, otifRisk: 0.02,
  inventoryAccuracy: 88, cycleCountCoverage: 25, excessInventoryReduction: 0.12,
  replenishmentType: 'reactive'
};
const r = api.calcROI(v);
function assertEq(actual, expected, label) {
  if (Math.round(actual) !== Math.round(expected)) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}
assertEq(r.laborSav, 750000, 'labor savings');
assertEq(r.shrinkSav, 80000, 'shrinkage savings');
assertEq(r.carrySav, 375000, 'carrying savings');
assertEq(r.otifSav, 100000, 'OTIF savings');
assertEq(r.itSav, 150000, 'IT savings');
assertEq(r.annualBenefit, 1455000, 'total annual benefit');
assertEq(r.netY1, 1245000, 'net year 1');
assertEq(r.totalInvestY1, 210000, 'year 1 total investment');
if (!r.cashflows.every(c => Math.round(c.invest) === 120000)) throw new Error('cashflow recurring investment should not include one-time costs');
const sc = api.getScenarioRange(v);
if (!(sc.conservative.annualBenefit < sc.expected.annualBenefit && sc.expected.annualBenefit < sc.aggressive.annualBenefit)) throw new Error('scenario range ordering failed');
const wc = api.workingCapitalRelease(v);
assertEq(wc.low, 900000, 'working capital low');
assertEq(wc.high, 1500000, 'working capital high');
const loss = api.calcLossExposure(v, r);
if (!(loss.total > 0 && loss.inventoryDistortion > 0 && loss.processDrag > 0 && loss.serviceLeakage > 0 && loss.workingCapitalDrag > 0)) throw new Error('loss exposure did not calculate every component');
console.log('PASS: ROI engine validates all value fields and decision-engine components.');
