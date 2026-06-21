import { useRef, useEffect, useState } from 'react';
import { Mascot } from './Mascot';

export function JourneyLoading({ steps, activeNode, doneNodes }) {
  const pathRef = useRef(null);
  const [pos, setPos] = useState({ x: 60, y: 150 });
  const [waypoints, setWaypoints] = useState([]);
  const N = steps.length;

  const doneSet = new Set(doneNodes || []);
  const activeIdx = steps.findIndex(s => s.key === activeNode);
  const progressFrac = activeIdx < 0 ? 0 : (activeIdx + 0.5) / N;

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    const wps = steps.map((_, i) => {
      const pt = p.getPointAtLength((L * (i + 0.5)) / N);
      return { x: pt.x, y: pt.y };
    });
    setWaypoints(wps);
  }, [N]);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    const pt = p.getPointAtLength(L * Math.min(progressFrac, 0.995));
    setPos({ x: pt.x, y: pt.y });
  }, [progressFrac]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-surface-100 dark:bg-surface-900">
      <svg viewBox="0 0 880 220" preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
        <path d="M0 168 L90 110 L150 150 L230 86 L320 158 L400 122 L470 160 L560 100 L650 150 L730 116 L810 156 L880 130 L880 220 L0 220 Z" fill="#e2e8f0" />
        <path d="M0 190 Q220 158 440 178 T880 168 L880 220 L0 220 Z" fill="#cbd5e1" opacity=".8" />
        
        <path
          ref={pathRef}
          d="M40 168 C 160 130, 230 196, 350 168 S 560 118, 660 156 S 800 162, 842 152"
          fill="none" stroke="#94a3b8" strokeWidth="3"
          strokeDasharray="4 8" strokeLinecap="round" opacity=".8"
        />
        {waypoints.map((wp, i) => {
          const isDone = doneSet.has(steps[i].key);
          const isActive = steps[i].key === activeNode;
          const state = isDone ? "done" : isActive ? "active" : "todo";
          return (
            <g key={i} transform={`translate(${wp.x}, ${wp.y})`}>
              <circle r={state === "todo" ? 4.5 : 6.5}
                fill={state === "done" ? "#10b981" : "#ffffff"}
                stroke={state === "todo" ? "#94a3b8" : "#10b981"}
                strokeWidth="2.5"
                style={{ transition: "all .4s" }} />
              {state === "done" && (
                <path d="M-2.6 0 l1.8 2.2 3.4 -4.4" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              )}
            </g>
          );
        })}
      </svg>
      <div
        className="absolute z-10"
        style={{
          left: `${(pos.x / 880) * 100}%`,
          top: `${(pos.y / 220) * 100}%`,
          transform: "translate(-50%, -94%)",
          transition: "left 1.1s cubic-bezier(.45,.05,.4,1), top 1.1s cubic-bezier(.45,.05,.4,1)",
        }}
      >
        <Mascot size={48} pose={doneNodes && doneNodes.length >= N - 1 ? "cheer" : "walk"} />
      </div>
    </div>
  );
}
