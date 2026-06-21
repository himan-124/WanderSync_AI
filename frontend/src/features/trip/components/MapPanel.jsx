import React, { useEffect, useRef, useState, Fragment } from 'react';
import { initAmapForDay, drawNavPairRoute, restoreFullRoute, destroyAmap } from '@/services/api';

export function DayMap({ mapPoints, dayKey }) {
  const pts = mapPoints || [];
  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");
  let spotNo = 0;
  const spotNums = pts.map(p => (p.kind === "meal" ? null : ++spotNo));

  return (
    <div className="w-full h-full relative overflow-hidden bg-surface-50 dark:bg-surface-950 rounded-2xl">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" key={dayKey} className="w-full h-full object-cover">
        <g stroke="currentColor" className="text-surface-200 dark:text-surface-800" strokeWidth=".35">
          {[15, 30, 45, 60, 75, 90].map((v) => (
            <Fragment key={v}>
              <line x1={v + 4} y1="-5" x2={v - 8} y2="105" />
              <line x1="-5" y1={v} x2="105" y2={v - 6} />
            </Fragment>
          ))}
        </g>
        <path d="M-5 84 Q 24 72 46 84 T 105 80 L 105 105 L -5 105 Z" className="fill-blue-100 dark:fill-blue-900/30" />
        <path d="M58 -5 q 10 18 -2 32 q -8 11 2 22" fill="none" className="stroke-blue-100 dark:stroke-blue-900/30" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        <ellipse cx="22" cy="22" rx="16" ry="11" className="fill-green-100 dark:fill-green-900/20" />
        <ellipse cx="84" cy="38" rx="13" ry="9" className="fill-green-100 dark:fill-green-900/20" />
        <ellipse cx="44" cy="62" rx="9" ry="6" className="fill-green-100 dark:fill-green-900/20" opacity=".8" />
        {poly && (
          <polyline
            points={poly} fill="none"
            className="stroke-primary-500" strokeWidth=".9"
            strokeDasharray="2 1.9" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: "routeDash 30s linear infinite" }}
          />
        )}
        <style>{`@keyframes routeDash { to { stroke-dashoffset: -92; } }`}</style>
        {pts.map((p, i) => (
          <g key={`${dayKey}-${i}`} style={{ "--pin-delay": `${i * 0.12 + 0.1}s`, transformOrigin: `${p.x}px ${p.y}px` }} className="animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_both] [animation-delay:var(--pin-delay)]">
            {p.kind === "meal" ? (
              <g>
                <rect x={p.x - 2.6} y={p.y - 2.6} width="5.2" height="5.2" rx="1.2"
                  className="fill-second-500" transform={`rotate(45 ${p.x} ${p.y})`} />
                <circle cx={p.x} cy={p.y} r=".9" className="fill-white dark:fill-surface-900" />
              </g>
            ) : (
              <g>
                <circle cx={p.x} cy={p.y} r="3.4" className="fill-primary-500" />
                <text x={p.x} y={p.y + 1.6} textAnchor="middle" fontSize="4.2" fontWeight="800" className="fill-white" fontFamily="inherit">{spotNums[i]}</text>
              </g>
            )}
            <text x={p.x} y={p.y - 5} textAnchor="middle" style={{ fontSize: "3.4px" }} className="fill-surface-900 dark:fill-white font-medium drop-shadow-md">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function MapPanel({ day, dayIdx, navPair, onNavClear }) {
  const amapRef = useRef(null);
  const [amapReady, setAmapReady] = useState(null);
  const hasGeo = (day.mapPoints || []).some(p => p.lat && p.lng);

  const ptsSig = (day.mapPoints || []).map(p => p.name).join("|");

  useEffect(() => {
    if (!hasGeo) { setAmapReady(false); return; }
    let alive = true;
    initAmapForDay(amapRef.current, day.mapPoints).then(ok => { if (alive) setAmapReady(ok); });
    return () => { alive = false; };
  }, [dayIdx, hasGeo, ptsSig]);

  useEffect(() => {
    if (amapReady !== true) return;
    if (navPair) {
      drawNavPairRoute(amapRef.current, navPair.from, navPair.to);
    } else {
      restoreFullRoute(amapRef.current, day.mapPoints);
    }
  }, [navPair, amapReady, day.mapPoints]); 

  useEffect(() => () => destroyAmap(amapRef.current), []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-900 rounded-3xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden">
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-surface-50 dark:bg-surface-950">
        <span className="font-bold text-surface-900 dark:text-white">Day {dayIdx + 1} Route Map</span>
        {navPair && onNavClear && (
          <button className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors" onClick={onNavClear}>
            ✕ Stop Navigation
          </button>
        )}
        {amapReady !== true && !navPair && <span className="text-xs font-medium text-surface-500 bg-surface-200 dark:bg-surface-800 px-2 py-1 rounded-md">Location Map · Relative Positions</span>}
      </div>
      <div className="flex-1 relative min-h-[300px]">
        <DayMap mapPoints={day.mapPoints} dayKey={dayIdx} />
        {hasGeo && (
          <div
            ref={amapRef}
            className="absolute inset-0 z-10"
            style={{
              opacity: amapReady === true ? 1 : 0,
              pointerEvents: amapReady === true ? "auto" : "none",
              transition: "opacity .4s ease",
            }}
          />
        )}
      </div>
      <div className="p-3 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 flex flex-wrap gap-4 text-xs font-medium text-surface-600 dark:text-surface-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>Attraction</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-second-500 transform rotate-45"></span>Restaurant</span>
        {amapReady !== true && <span className="ml-auto italic opacity-80">Dotted line shows travel route</span>}
      </div>
    </div>
  );
}
