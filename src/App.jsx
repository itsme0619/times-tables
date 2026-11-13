import { useCallback, useEffect, useState } from 'react';
import { loadData, saveData, newKid, PRACTICE_AFTER_FAIL } from './storage';
import KidPicker from './components/KidPicker';
import KidHome from './components/KidHome';
import Test from './components/Test';
import Practice from './components/Practice';
import Grownups from './components/Grownups';

export default function App() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState(() => (loadData().kids.length ? 'pick' : 'grownups'));
  const [kidId, setKidId] = useState(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => saveData(data), [data]);

  const kid = data.kids.find((k) => k.id === kidId);

  const updateKid = useCallback((id, fn) => {
    setData((d) => ({ ...d, kids: d.kids.map((k) => (k.id === id ? { ...k, ...fn(k) } : k)) }));
  }, []);

  const log = (k, entry) => [...k.history, { ...entry, date: new Date().toISOString() }].slice(-200);

  // ---- kid actions ----
  function handleTestResult(passed, score) {
    updateKid(kidId, (k) => ({
      history: log(k, { type: 'test', n: k.level, score }),
      ...(passed ? { pendingScoop: k.level } : { practiceNeeded: PRACTICE_AFTER_FAIL }),
    }));
  }

  const handlePracticeDone = useCallback(() => {
    updateKid(kidId, (k) => ({
      practiceNeeded: Math.max(0, k.practiceNeeded - 1),
      history: log(k, { type: 'practice', n: k.level }),
    }));
  }, [kidId, updateKid]);

  function handlePickFlavor(flavor) {
    updateKid(kidId, (k) => ({
      scoops: [...k.scoops, { n: k.pendingScoop, flavor }],
      level: k.pendingScoop + 1,
      pendingScoop: null,
      practiceNeeded: 0,
    }));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  // ---- grown-up actions ----
  const addKid = (name) => setData((d) => ({ ...d, kids: [...d.kids, newKid(name)] }));
  const renameKid = (id, name) => updateKid(id, () => ({ name }));
  const resetKid = (id) => updateKid(id, (k) => ({ ...newKid(k.name), id: k.id }));
  const deleteKid = (id) => setData((d) => ({ ...d, kids: d.kids.filter((k) => k.id !== id) }));

  const goHome = () => setView(kid ? 'home' : 'pick');

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={() => { setKidId(null); setView(data.kids.length ? 'pick' : 'grownups'); }}>
          🍦 <span>Times Table Scoops</span>
        </button>
        <div className="topbar-right">
          {kid && view !== 'test' && (
            <button className="btn ghost small" onClick={() => { setKidId(null); setView('pick'); }}>
              Switch kid
            </button>
          )}
          {view !== 'test' && view !== 'grownups' && (
            <button className="btn ghost small" onClick={() => setView('grownups')}>Grown-ups</button>
          )}
        </div>
      </header>

      <main>
        {view === 'grownups' && (
          <Grownups
            kids={data.kids}
            firstRun={data.kids.length === 0}
            onAdd={addKid}
            onRename={renameKid}
            onReset={resetKid}
            onDelete={deleteKid}
            onSetLevel={(id, patch) => updateKid(id, () => patch)}
            onDone={() => setView(kid ? 'home' : 'pick')}
          />
        )}

        {view === 'pick' && (
          <KidPicker kids={data.kids} onPick={(id) => { setKidId(id); setView('home'); }} />
        )}

        {view === 'home' && kid && (
          <KidHome
            kid={kid}
            justAdded={justAdded}
            onTest={() => setView('test')}
            onPractice={() => setView('practice')}
            onPickFlavor={handlePickFlavor}
          />
        )}

        {view === 'test' && kid && <Test key={kid.id + kid.level} kid={kid} onResult={handleTestResult} onExit={goHome} />}

        {view === 'practice' && kid && <Practice key={kid.id + kid.level} kid={kid} onComplete={handlePracticeDone} onExit={goHome} />}
      </main>
    </div>
  );
}
