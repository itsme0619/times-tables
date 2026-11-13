import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { auth, db, configured } from './firebase';
import { newKid, PRACTICE_AFTER_FAIL, takeOldLocalKids, clearOldLocalKids } from './storage';
import Login from './components/Login';
import KidPicker from './components/KidPicker';
import KidHome from './components/KidHome';
import Test from './components/Test';
import Practice from './components/Practice';
import Grownups from './components/Grownups';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [kids, setKids] = useState(null); // null = loading
  const [view, setView] = useState('pick');
  const [kidId, setKidId] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState('');
  const kidsRef = useRef([]);
  kidsRef.current = kids || [];

  // ---- auth ----
  useEffect(() => {
    if (!configured) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setKids(null);
      setKidId(null);
      setView('pick');
    });
  }, []);

  const kidsCol = user ? collection(db, 'families', user.uid, 'kids') : null;

  // ---- live kid list (updates instantly across devices) ----
  useEffect(() => {
    if (!user) return;
    const col = collection(db, 'families', user.uid, 'kids');
    let imported = false;
    return onSnapshot(
      col,
      async (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        if (list.length === 0 && snap.metadata.fromCache) return; // wait for the server before deciding there are no kids

        // One-time import of progress saved by the old device-only version.
        if (!imported && !snap.metadata.fromCache && list.length === 0) {
          imported = true;
          const old = takeOldLocalKids();
          if (old.length) {
            const batch = writeBatch(db);
            old.forEach((k) => batch.set(doc(col), k));
            await batch.commit();
            clearOldLocalKids();
            return;
          }
        }

        setKids(list);
        if (list.length === 0) setView('grownups');
      },
      (err) => setError(`Couldn’t load progress: ${err.message}`)
    );
  }, [user]);

  const kid = kids?.find((k) => k.id === kidId);

  const save = (promise) => promise.catch((err) => setError(`Couldn’t save: ${err.message}`));

  const updateKid = useCallback(
    (id, fn) => {
      const current = kidsRef.current.find((k) => k.id === id);
      if (!current || !user) return;
      save(updateDoc(doc(db, 'families', user.uid, 'kids', id), fn(current)));
    },
    [user]
  );

  // ---- kid actions ----
  function handleTestResult(passed) {
    updateKid(kidId, (k) => (passed ? { pendingScoop: k.level } : { practiceNeeded: PRACTICE_AFTER_FAIL }));
  }

  const handlePracticeDone = useCallback(() => {
    updateKid(kidId, (k) => ({ practiceNeeded: Math.max(0, (k.practiceNeeded || 0) - 1) }));
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
  const addKid = (name) => save(setDoc(doc(kidsCol), newKid(name)));
  const renameKid = (id, name) => updateKid(id, () => ({ name }));
  const resetKid = (id) => updateKid(id, (k) => ({ ...newKid(k.name), createdAt: k.createdAt }));
  const deleteKid = (id) => save(deleteDoc(doc(kidsCol, id)));

  const goHome = () => setView(kid ? 'home' : 'pick');

  // ---- screens ----
  let body;
  if (!configured) {
    body = (
      <div className="card center-card">
        <div className="big-emoji">🔧</div>
        <h2>Almost ready!</h2>
        <p className="lead">Paste your Firebase config into <code>src/firebase-config.js</code>.</p>
      </div>
    );
  } else if (user === undefined || (user && kids === null)) {
    body = <div className="loading">🍦 Loading…</div>;
  } else if (!user) {
    body = <Login />;
  } else if (view === 'grownups') {
    body = (
      <Grownups
        kids={kids}
        firstRun={kids.length === 0}
        email={user.email}
        onAdd={addKid}
        onRename={renameKid}
        onReset={resetKid}
        onDelete={deleteKid}
        onPatch={(id, patch) => updateKid(id, () => patch)}
        onSignOut={() => signOut(auth)}
        onDone={() => setView(kid ? 'home' : 'pick')}
      />
    );
  } else if (view === 'home' && kid) {
    body = (
      <KidHome kid={kid} justAdded={justAdded} onTest={() => setView('test')} onPractice={() => setView('practice')} onPickFlavor={handlePickFlavor} />
    );
  } else if (view === 'test' && kid) {
    body = <Test key={kid.id + kid.level} kid={kid} onResult={handleTestResult} onExit={goHome} />;
  } else if (view === 'practice' && kid) {
    body = <Practice key={kid.id + kid.level} kid={kid} onComplete={handlePracticeDone} onExit={goHome} />;
  } else {
    body = <KidPicker kids={kids} onPick={(id) => { setKidId(id); setView('home'); }} />;
  }

  const signedIn = configured && user;

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={() => { setKidId(null); setView(kids?.length ? 'pick' : 'grownups'); }}>
          🍦 <span>Times Table Scoops</span>
        </button>
        {signedIn && kids && (
          <div className="topbar-right">
            {kid && view !== 'test' && (
              <button className="btn ghost small" onClick={() => { setKidId(null); setView('pick'); }}>Switch kid</button>
            )}
            {view !== 'test' && view !== 'grownups' && (
              <button className="btn ghost small" onClick={() => setView('grownups')}>Grown-ups</button>
            )}
          </div>
        )}
      </header>

      {error && (
        <div className="error-bar" onClick={() => setError('')}>
          {error} <span className="muted">(tap to dismiss)</span>
        </div>
      )}

      <main>{body}</main>
    </div>
  );
}
