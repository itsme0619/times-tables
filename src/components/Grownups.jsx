import { useState } from 'react';
import { TOTAL_LEVELS } from '../storage';

export default function Grownups({ kids, firstRun: firstRunProp, onAdd, onRename, onReset, onDelete, onSetLevel, onDone }) {
  const [firstRun] = useState(firstRunProp); // stay in "welcome" mode until they leave this screen
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState(null); // { id, action }

  function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  }

  return (
    <div className="card grownups">
      <h2>{firstRun ? '🍦 Welcome! Add your kids to get started' : 'Grown-ups'}</h2>
      {firstRun && (
        <p className="muted">
          Each kid starts on the 1× facts. Pass a test with 100% to earn a scoop and move on. Miss any and they
          need 2 practice sessions before trying again. 12 scoops = real ice cream!
        </p>
      )}

      <form className="row" onSubmit={add}>
        <input className="text-input" placeholder="Kid's name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn primary" type="submit">Add kid</button>
      </form>

      {kids.length > 0 && (
        <table className="kid-table">
          <thead>
            <tr><th>Name</th><th>Working on</th><th>Scoops</th><th>Practices owed</th><th /></tr>
          </thead>
          <tbody>
            {kids.map((k) => (
              <tr key={k.id}>
                <td>
                  <input className="text-input slim" defaultValue={k.name} onBlur={(e) => e.target.value.trim() && onRename(k.id, e.target.value.trim())} />
                </td>
                <td>{k.level > TOTAL_LEVELS ? 'Done!' : `${k.level}×`}</td>
                <td>{k.scoops.length}</td>
                <td>{k.practiceNeeded}</td>
                <td className="actions">
                  {k.practiceNeeded > 0 && (
                    <button className="btn ghost small" onClick={() => onSetLevel(k.id, { practiceNeeded: 0 })}>Unlock test</button>
                  )}
                  {confirm?.id === k.id ? (
                    <>
                      <button
                        className="btn danger small"
                        onClick={() => {
                          confirm.action === 'reset' ? onReset(k.id) : onDelete(k.id);
                          setConfirm(null);
                        }}
                      >
                        Yes, {confirm.action}
                      </button>
                      <button className="btn ghost small" onClick={() => setConfirm(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn ghost small" onClick={() => setConfirm({ id: k.id, action: 'reset' })}>Reset</button>
                      <button className="btn ghost small" onClick={() => setConfirm({ id: k.id, action: 'delete' })}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {kids.length > 0 && (
        <details className="history">
          <summary>Recent activity</summary>
          {kids.map((k) => (
            <div key={k.id}>
              <h4>{k.name}</h4>
              <ul>
                {k.history.slice(-10).reverse().map((h, i) => (
                  <li key={i}>
                    {new Date(h.date).toLocaleString()} — {h.n}× {h.type}
                    {h.type === 'test' && ` · ${h.score}/12 ${h.score === 12 ? '✅' : '❌'}`}
                  </li>
                ))}
                {k.history.length === 0 && <li className="muted">Nothing yet</li>}
              </ul>
            </div>
          ))}
        </details>
      )}

      <div className="row end">
        <button className="btn primary big" disabled={kids.length === 0} onClick={onDone}>
          {firstRun ? "Let's go!" : 'Done'}
        </button>
      </div>
    </div>
  );
}
