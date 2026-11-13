import { useId } from 'react';
import { FLAVORS_BY_ID } from '../flavors';

const R = 48; // scoop radius
const STEP = 42; // vertical distance between stacked scoops
const CONE_H = 120;
const W = 200;
const CX = W / 2;

const DOTS = [
  [-22, -18], [10, -28], [26, -8], [-6, -4], [-30, 2], [14, 6], [-12, -32],
];
const SPRINKLES = [
  [-24, -16, 30, '#FF5C8A'], [8, -30, -40, '#4FC3F7'], [26, -6, 70, '#FFD54F'],
  [-4, -2, -20, '#81C784'], [-32, 2, 50, '#BA68C8'], [16, 8, 10, '#FF8A65'],
  [-12, -34, 80, '#4DB6AC'],
];

export function scoopPath(cx, cy, r) {
  const w = (2 * r) / 4;
  let d = `M ${cx - r} ${cy} A ${r} ${r * 0.92} 0 0 1 ${cx + r} ${cy}`;
  for (let k = 0; k < 4; k++) d += ` q ${-w / 2} ${r * 0.3} ${-w} 0`;
  return d + ' Z';
}

export function Scoop({ cx, cy, r = R, flavorId, label, className }) {
  const f = FLAVORS_BY_ID[flavorId] || FLAVORS_BY_ID.vanilla;
  const s = r / R;
  return (
    <g className={className}>
      <path d={scoopPath(cx, cy, r)} fill={f.color} stroke="rgba(80,40,20,.25)" strokeWidth={2} />
      {f.dots &&
        DOTS.map(([x, y], i) => (
          <circle key={i} cx={cx + x * s} cy={cy + y * s} r={3.5 * s} fill={f.dots} />
        ))}
      {f.sprinkles &&
        SPRINKLES.map(([x, y, rot, c], i) => (
          <rect
            key={i}
            x={cx + x * s - 5 * s}
            y={cy + y * s - 1.5 * s}
            width={10 * s}
            height={3 * s}
            rx={1.5 * s}
            fill={c}
            transform={`rotate(${rot} ${cx + x * s} ${cy + y * s})`}
          />
        ))}
      <ellipse cx={cx - r * 0.45} cy={cy - r * 0.5} rx={r * 0.18} ry={r * 0.1} fill="#fff" opacity={0.45} transform={`rotate(-30 ${cx - r * 0.45} ${cy - r * 0.5})`} />
      {label && (
        <text
          x={cx}
          y={cy - r * 0.12}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={r * 0.5}
          fontWeight={800}
          fontFamily="'Baloo 2', system-ui, sans-serif"
          fill={f.dark ? '#fff' : '#5a3a22'}
          stroke={f.dark ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.7)'}
          strokeWidth={3}
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * scoops: [{ flavor, label }]
 * next: label for the dashed "next scoop" placeholder (or null)
 */
export default function Cone({ scoops = [], next = null, cherry = false, animateLast = false, className = '', style }) {
  const pid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const slots = scoops.length + (next ? 1 : 0);
  const topPad = R + 14 + (cherry ? 26 : 0);
  const H = CONE_H + 12 + Math.max(slots - 1, 0) * STEP + topPad;
  const coneTop = H - CONE_H - 4;
  const cy = (i) => coneTop - 8 - i * STEP;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`cone ${className}`} style={style} role="img" aria-label={`Ice cream cone with ${scoops.length} scoops`}>
      <defs>
        <pattern id={`waffle${pid}`} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="18" height="18" fill="#E9A65A" />
          <path d="M0 0H18M0 0V18" stroke="#C47F35" strokeWidth="3" />
        </pattern>
      </defs>

      {scoops.map((s, i) => (
        <Scoop
          key={i}
          cx={CX}
          cy={cy(i)}
          flavorId={s.flavor}
          label={s.label}
          className={animateLast && i === scoops.length - 1 ? 'scoop-drop' : ''}
        />
      ))}

      {next && (
        <g opacity={0.6}>
          <path d={scoopPath(CX, cy(scoops.length), R)} fill="rgba(255,255,255,.55)" stroke="#c79bb0" strokeWidth={3} strokeDasharray="8 7" />
          <text x={CX} y={cy(scoops.length) - 6} textAnchor="middle" dominantBaseline="middle" fontSize={20} fontWeight={800} fontFamily="'Baloo 2', system-ui, sans-serif" fill="#a0708a">
            {next}
          </text>
        </g>
      )}

      {cherry && scoops.length > 0 && (
        <g className="cherry">
          <path d={`M ${CX} ${cy(scoops.length - 1) - R * 0.9 - 8} q 6 -18 18 -22`} stroke="#3d7a2a" strokeWidth={3} fill="none" />
          <circle cx={CX} cy={cy(scoops.length - 1) - R * 0.9 - 2} r={11} fill="#E3263B" />
          <circle cx={CX - 4} cy={cy(scoops.length - 1) - R * 0.9 - 6} r={3} fill="#fff" opacity={0.6} />
        </g>
      )}

      {/* cone */}
      <path d={`M ${CX - 60} ${coneTop} L ${CX + 60} ${coneTop} L ${CX} ${H - 2} Z`} fill={`url(#waffle${pid})`} stroke="#B8732C" strokeWidth={3} strokeLinejoin="round" />
      <rect x={CX - 66} y={coneTop - 6} width={132} height={16} rx={8} fill="#D98E3F" stroke="#B8732C" strokeWidth={2} />
    </svg>
  );
}

export function MiniScoop({ flavorId, size = 70 }) {
  return (
    <svg viewBox="0 0 100 80" width={size} height={size * 0.8} aria-hidden="true">
      <Scoop cx={50} cy={50} r={40} flavorId={flavorId} />
    </svg>
  );
}
