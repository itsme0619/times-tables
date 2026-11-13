import { useEffect, useRef, useState } from 'react';
import Cone from './Cone';
import { randomFlavorId } from '../flavors';
import { shuffle } from '../storage';

const CHEERS = ['Yum!', 'Sweet!', 'Scoop-tastic!', 'Nailed it!', 'Delicious!', 'Brain freeze… of genius!', 'Sprinkle-rific!', 'You got it!'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Practice game: "Scoop Stacker"
 * One fact at a time. Each right answer stacks a scoop on your practice cone.
 * A missed fact shows the right answer, you type it to keep going,
 * and it comes back later in the round. Round ends when all 12 are right.
 */
export default function Practice({ kid, onComplete, onExit }) {
  const n = kid.level;
  const [queue, setQueue] = useState(() => shuffle(Array.from({ length: 12 }, (_, i) => i + 1)));
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('ask'); // ask | right | fix | done
  const [stack, setStack] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [misses, setMisses] = useState(0);
  const [cheer, setCheer] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  const completed = useRef(false);

  const current = queue[0];
  const answer = n * current;
  const done = 12 - queue.length;

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode, current]);

  useEffect(() => {
    if (mode === 'done' && !completed.current) {
      completed.current = true;
      onComplete();
    }
  }, [mode, onComplete]);

  function check(e) {
    e?.preventDefault();
    if (input.trim() === '') return;

    if (mode === 'fix') {
      if (Number(input) === answer) {
        setQueue((q) => [...q.slice(1), q[0]]); // send it to the back of the line
        setInput('');
        setMode('ask');
      } else {
        triggerShake();
      }
      return;
    }

    if (mode !== 'ask') return;

    if (Number(input) === answer) {
      const s = streak + 1;
      setStreak(s);
      setBestStreak((b) => Math.max(b, s));
      setStack((st) => [...st, { flavor: randomFlavorId() }]);
      setCheer(s >= 3 ? `${pick(CHEERS)} 🔥 ${s} in a row!` : pick(CHEERS));
      setMode('right');
      const last = queue.length === 1;
      setTimeout(() => {
        setInput('');
        if (last) {
          setMode('done');
        } else {
          setQueue((q) => q.slice(1));
          setMode('ask');
        }
      }, 900);
    } else {
      setStreak(0);
      setMisses((m) => m + 1);
      setInput('');
      setMode('fix');
      triggerShake();
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  }

  if (mode === 'done') {
    const left = kid.practiceNeeded;
    return (
      <div className="card center-card">
        <div className="big-emoji">🍨</div>
        <h2>Practice complete!</h2>
        <p className="lead">
          You stacked <b>{stack.length}</b> scoops! Best streak: <b>{bestStreak}</b> 🔥
          {misses === 0 && <><br />Zero misses — wow!</>}
        </p>
        {left > 0 ? (
          <p className="pill">{left} more practice {left === 1 ? 'session' : 'sessions'} to unlock the test</p>
        ) : (
          <p className="pill good">The {n}× test is unlocked! 🔓</p>
        )}
        <div className="row">
          <button className="btn ghost" onClick={onExit}>Done</button>
          <button
            className="btn primary"
            onClick={() => {
              completed.current = false;
              setQueue(shuffle(Array.from({ length: 12 }, (_, i) => i + 1)));
              setStack([]);
              setStreak(0);
              setBestStreak(0);
              setMisses(0);
              setInput('');
              setMode('ask');
            }}
          >
            Practice again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card practice">
      <div className="practice-head">
        <h2>Scoop Stacker · {n}×</h2>
        <div className="streak">{streak >= 2 ? `🔥 ${streak}` : ''}</div>
      </div>
      <div className="progress" aria-label={`${done} of 12 done`}>
        <div className="progress-fill" style={{ width: `${(done / 12) * 100}%` }} />
        <span>{done} / 12</span>
      </div>

      <div className="practice-body">
        <form className={`question ${shake ? 'shake' : ''} ${mode}`} onSubmit={check}>
          <div className="q-text">
            {n} × {current} = {mode === 'fix' && <span className="reveal">{answer}</span>}
          </div>

          {mode === 'fix' && <p className="hint">Oops! {n} × {current} is <b>{answer}</b>. Type it to keep going.</p>}
          {mode === 'right' && <p className="cheer">{cheer}</p>}

          <input
            ref={inputRef}
            className="q-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={input}
            disabled={mode === 'right'}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
            aria-label="Your answer"
            placeholder="?"
          />
          <button className="btn primary big" type="submit" disabled={mode === 'right'}>
            {mode === 'fix' ? 'Got it' : 'Check'}
          </button>
        </form>

        <div className="practice-cone">
          <Cone scoops={stack} animateLast style={{ maxHeight: '46vh' }} />
        </div>
      </div>

      <div className="row">
        <button className="btn ghost small" onClick={onExit}>Quit practice</button>
      </div>
    </div>
  );
}
