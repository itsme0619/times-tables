import { useState } from 'react';
import { FLAVORS } from '../flavors';
import { MiniScoop } from './Cone';

export default function FlavorPicker({ n, onPick }) {
  const [choice, setChoice] = useState(null);
  return (
    <div className="flavor-picker">
      <h3>🎉 You mastered your {n}× facts! Pick a flavor for your scoop:</h3>
      <div className="flavor-grid">
        {FLAVORS.map((f) => (
          <button
            key={f.id}
            className={`flavor ${choice === f.id ? 'chosen' : ''}`}
            onClick={() => setChoice(f.id)}
          >
            <MiniScoop flavorId={f.id} />
            <span>{f.name}</span>
          </button>
        ))}
      </div>
      <button className="btn primary big" disabled={!choice} onClick={() => onPick(choice)}>
        {choice ? 'Add my scoop!' : 'Choose a flavor'}
      </button>
    </div>
  );
}
