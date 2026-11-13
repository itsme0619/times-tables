import { useEffect, useRef, useState } from 'react';
import { FACTS_PER_TEST, TEST_SECONDS, PRACTICE_AFTER_FAIL } from '../storage';

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function Test({ kid, onResult, onExit }) {
  const n = kid.level;
  const facts = Array.from({ length: FACTS_PER_TEST }, (_, i) => i + 1);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState(() => Array(FACTS_PER_TEST).fill(''));
  const [timeLeft, setTimeLeft] = useState(TEST_SECONDS);
  const [result, setResult] = useState(null);
  const [confirmBlank, setConfirmBlank] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const inputs = useRef([]);
  const submitted = useRef(false);

  // countdown
  useEffect(() => {
    if (!started || result) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [started, result]);

  // time's up → auto-submit
  useEffect(() => {
    if (started && !result && timeLeft === 0) submit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    if (started) inputs.current[0]?.focus();
  }, [started]);

  function submit(timedOut = false) {
    if (submitted.current) return;
    submitted.current = true;
    const a = answersRef.current;
    const rows = facts.map((f, i) => {
      const given = a[i].trim();
      return { f, given, correct: given !== '' && Number(given) === n * f };
    });
    const score = rows.filter((r) => r.correct).length;
    const passed = score === FACTS_PER_TEST;
    setResult({ rows, score, passed, timedOut, timeUsed: TEST_SECONDS - timeLeft });
    onResult(passed, score);
  }

  function handleSubmitClick() {
    const blanks = answers.filter((a) => a.trim() === '').length;
    if (blanks > 0 && !confirmBlank) {
      setConfirmBlank(true);
      return;
    }
    submit(false);
  }

  function setAnswer(i, v) {
    const clean = v.replace(/[^0-9]/g, '').slice(0, 3);
    setAnswers((prev) => prev.map((a, j) => (j === i ? clean : a)));
    setConfirmBlank(false);
  }

  function onKeyDown(e, i) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (i < FACTS_PER_TEST - 1) inputs.current[i + 1]?.focus();
      else handleSubmitClick();
    } else if (e.key === 'ArrowUp' && i > 0) {
      e.preventDefault();
      inputs.current[i - 1]?.focus();
    }
  }

  if (!started) {
    return (
      <div className="card center-card">
        <div className="big-emoji">⏱️</div>
        <h2>{n}× Test</h2>
        <p className="lead">
          You'll get all 12 of your <b>{n}×</b> facts.<br />
          You have <b>2 minutes</b>. You need <b>every one right</b> to earn your scoop!
        </p>
        <p className="muted">Tip: press Enter to jump to the next question.</p>
        <div className="row">
          <button className="btn ghost" onClick={onExit}>Not yet</button>
          <button className="btn primary big" onClick={() => setStarted(true)}>Start the clock!</button>
        </div>
      </div>
    );
  }

  const blanks = answers.filter((a) => a.trim() === '').length;

  return (
    <div className="card">
      {!result && (
        <div className={`timer ${timeLeft <= 20 ? 'warn' : ''}`} aria-live="polite">
          ⏱ {fmt(timeLeft)}
        </div>
      )}

      <h2>{n}× Test</h2>

      {result && (
        <div className={`result-banner ${result.passed ? 'pass' : 'fail'}`}>
          {result.passed ? (
            <>
              <div className="big-emoji">🎉🍦🎉</div>
              <h3>Perfect score! 12 / 12</h3>
              <p>You mastered your {n}× facts in {fmt(result.timeUsed)}! Time to pick your flavor.</p>
              <button className="btn primary big" onClick={onExit}>Pick my scoop!</button>
            </>
          ) : (
            <>
              <h3>{result.score} / 12 {result.timedOut && <span className="muted">(time ran out)</span>}</h3>
              <p>
                So close! Look at the ones you missed below. Do <b>{PRACTICE_AFTER_FAIL} practice sessions</b> and
                then you can try the test again.
              </p>
              <button className="btn primary" onClick={onExit}>Go practice</button>
            </>
          )}
        </div>
      )}

      <div className="test-grid">
        {facts.map((f, i) => {
          const row = result?.rows[i];
          return (
            <label key={f} className={`test-row ${row ? (row.correct ? 'right' : 'wrong') : ''}`}>
              <span className="fact">{n} × {f} =</span>
              <input
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={answers[i]}
                disabled={!!result}
                onChange={(e) => setAnswer(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(e, i)}
                aria-label={`${n} times ${f}`}
              />
              {row && (
                <span className="mark">
                  {row.correct ? '✓' : <>✗ <span className="fix">{n * f}</span></>}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {!result && (
        <div className="row end">
          {confirmBlank && <span className="warn-text">{blanks} left blank — tap again to submit anyway</span>}
          <button className="btn primary big" onClick={handleSubmitClick}>
            {confirmBlank ? 'Yes, submit' : 'Submit test'}
          </button>
        </div>
      )}
    </div>
  );
}
