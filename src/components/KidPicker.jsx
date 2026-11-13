import Cone from './Cone';
import { coneScoops } from './KidHome';
import { TOTAL_LEVELS } from '../storage';

export default function KidPicker({ kids, onPick }) {
  return (
    <div className="picker">
      <h1 className="title">Who's scooping today?</h1>
      <div className="kid-cards">
        {kids.map((k) => (
          <button key={k.id} className="kid-card" onClick={() => onPick(k.id)}>
            <Cone scoops={coneScoops(k)} cherry={k.level > TOTAL_LEVELS} style={{ height: 180 }} />
            <span className="kid-name">{k.name}</span>
            <span className="kid-sub">
              {k.level > TOTAL_LEVELS ? 'All done! 🏆' : `Working on ${k.level}×`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
