// All progress is saved in the browser (localStorage) on the device you use.
const KEY = 'times-table-scoops-v1';

export const TOTAL_LEVELS = 12;
export const FACTS_PER_TEST = 12; // n x 1 through n x 12
export const TEST_SECONDS = 120;
export const PRACTICE_AFTER_FAIL = 2;

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { kids: [] };
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function newKid(name) {
  return {
    id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random()),
    name,
    level: 1, // the multiplier they're working on (13 = all done)
    scoops: [], // [{ n: 1, flavor: 'mint' }]
    pendingScoop: null, // passed a test but hasn't picked a flavor yet
    practiceNeeded: 0, // practice sessions required before the next test
    history: [], // [{ type: 'test'|'practice', n, score, date }]
  };
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
