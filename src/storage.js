// Progress is stored in Firebase Firestore at families/{familyUid}/kids/{kidId}.
// Each kid document holds only: name, level, scoops, practiceNeeded, pendingScoop, createdAt.

export const TOTAL_LEVELS = 12;
export const FACTS_PER_TEST = 12; // n x 1 through n x 12
export const TEST_SECONDS = 120;
export const PRACTICE_AFTER_FAIL = 2;

export function newKid(name) {
  return {
    name,
    level: 1, // the multiplier they're working on (13 = all done)
    scoops: [], // [{ n: 1, flavor: 'mint' }]
    pendingScoop: null, // passed a test but hasn't picked a flavor yet
    practiceNeeded: 0, // practice sessions required before the next test (0 = unlocked)
    createdAt: Date.now(),
  };
}

// Progress saved by the earlier, device-only version of the app (imported once on sign-in).
const OLD_KEY = 'times-table-scoops-v1';
export function takeOldLocalKids() {
  try {
    const raw = localStorage.getItem(OLD_KEY);
    if (!raw) return [];
    const kids = JSON.parse(raw)?.kids || [];
    return kids.map((k) => ({
      name: k.name,
      level: k.level ?? 1,
      scoops: k.scoops ?? [],
      pendingScoop: k.pendingScoop ?? null,
      practiceNeeded: k.practiceNeeded ?? 0,
      createdAt: Date.now(),
    }));
  } catch {
    return [];
  }
}
export function clearOldLocalKids() {
  try {
    localStorage.removeItem(OLD_KEY);
  } catch {
    /* ignore */
  }
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
