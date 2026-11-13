import Cone from './Cone';
import FlavorPicker from './FlavorPicker';
import { PRACTICE_AFTER_FAIL, TOTAL_LEVELS } from '../storage';

export function coneScoops(kid) {
  return kid.scoops.map((s) => ({ flavor: s.flavor, label: `${s.n}×` }));
}

export default function KidHome({ kid, onTest, onPractice, onPickFlavor, justAdded }) {
  const allDone = kid.level > TOTAL_LEVELS;
  const locked = kid.practiceNeeded > 0;
  const nextLabel = !allDone && !kid.pendingScoop ? `${kid.level}×?` : null;

  return (
    <div className="kid-home">
      <div className="cone-wrap">
        <Cone
          scoops={coneScoops(kid)}
          next={nextLabel}
          cherry={allDone}
          animateLast={justAdded}
          style={{ maxHeight: '72vh' }}
        />
        <p className="scoop-count">{kid.scoops.length} / {TOTAL_LEVELS} scoops</p>
      </div>

      <div className="kid-actions">
        <h2>Hi, {kid.name}! 👋</h2>

        {kid.pendingScoop ? (
          <FlavorPicker n={kid.pendingScoop} onPick={onPickFlavor} />
        ) : allDone ? (
          <div className="card center-card celebrate">
            <div className="big-emoji">🏆🍦🍒</div>
            <h3>ALL 12 SCOOPS!</h3>
            <p className="lead">You know every times table from 1× to 12×. Go claim your REAL ice cream!</p>
          </div>
        ) : (
          <>
            <p className="lead">
              You're working on your <b className="hl">{kid.level}× facts</b>.
            </p>

            <div className="choice-grid">
              <button className="choice practice-choice" onClick={onPractice}>
                <span className="choice-emoji">🎮</span>
                <span className="choice-title">Practice</span>
                <span className="choice-sub">Play Scoop Stacker</span>
              </button>

              <button className="choice test-choice" onClick={onTest} disabled={locked}>
                <span className="choice-emoji">{locked ? '🔒' : '⏱️'}</span>
                <span className="choice-title">Take the test</span>
                <span className="choice-sub">
                  {locked ? `Practice ${kid.practiceNeeded} more ${kid.practiceNeeded === 1 ? 'time' : 'times'} to unlock` : '12 facts · 2 minutes · 100% to win'}
                </span>
                {locked && (
                  <span className="lock-dots">
                    {Array.from({ length: PRACTICE_AFTER_FAIL }, (_, i) => (
                      <span key={i} className={`dot ${i < PRACTICE_AFTER_FAIL - kid.practiceNeeded ? 'on' : ''}`} />
                    ))}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
