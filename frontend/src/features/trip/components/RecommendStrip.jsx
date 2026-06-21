import React, { useState } from 'react';
import { Thumb } from './TripTimeline';

export function RecommendStrip({ candidates, editing }) {
  const [detail, setDetail] = useState(null);

  if (!candidates || !candidates.length) return null;
  
  return (
    <div className="bg-surface-50 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 p-4">
      <div className="font-semibold text-sm text-surface-600 dark:text-surface-400 mb-3 flex items-center gap-2">
        <span>🗺 AI Suggested Spots</span>
        {editing && <span className="opacity-70 font-normal">· Drag to timeline to change spot</span>}
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
        {candidates.map((c, i) => (
          <div
            key={i}
            className={`snap-center flex-shrink-0 w-48 bg-white dark:bg-surface-800 rounded-xl border transition-all ${editing ? "cursor-grab active:cursor-grabbing hover:border-primary-400" : "cursor-pointer hover:border-surface-300 dark:hover:border-surface-600"} ${detail === c ? "ring-2 ring-primary-500 border-primary-500" : "border-surface-200 dark:border-surface-700"} overflow-hidden shadow-sm hover:shadow-md`}
            draggable={editing}
            onDragStart={editing ? (e) => {
              e.dataTransfer.setData("application/json", JSON.stringify(c));
              e.dataTransfer.effectAllowed = "copy";
            } : undefined}
            onClick={() => setDetail(detail === c ? null : c)}
          >
            <div className="h-24 bg-cover bg-center border-b border-surface-100 dark:border-surface-700" style={c.photo ? { backgroundImage: `url('${c.photo}')` } : { backgroundColor: '#e2e8f0' }} />
            <div className="p-3">
              <div className="font-bold text-sm text-surface-900 dark:text-white truncate">{c.name}</div>
              <div className="text-xs text-surface-500 mt-1 flex items-center gap-2">
                {c.rating != null && <span className="text-yellow-600 font-medium">★ {Number(c.rating).toFixed(1)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {detail && (
        <div className="mt-4 bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-lg relative flex gap-6 animate-[fadeIn_0.2s_ease-out]">
          <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-100 dark:bg-surface-700 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors" onClick={() => setDetail(null)}>
            ✕
          </button>
          
          {detail.photo && (
            <div className="w-32 h-32 rounded-xl bg-cover bg-center shadow-sm flex-shrink-0" style={{ backgroundImage: `url('${detail.photo}')` }} />
          )}
          
          <div className="flex-1">
            <h4 className="text-xl font-bold text-surface-900 dark:text-white mb-4 pr-8">{detail.name}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              {detail.rating != null && (
                <div className="flex items-center gap-2 text-surface-600 dark:text-surface-300">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span>{Number(detail.rating).toFixed(1)} Rating</span>
                </div>
              )}
              {detail.address && (
                <div className="flex items-center gap-2 text-surface-600 dark:text-surface-300">
                  <span className="text-lg">📍</span>
                  <span className="truncate" title={detail.address}>{detail.address}</span>
                </div>
              )}
              {detail.open_time && (
                <div className="flex items-center gap-2 text-surface-600 dark:text-surface-300">
                  <span className="text-lg">🕐</span>
                  <span>{detail.open_time}</span>
                </div>
              )}
              {detail.cost && (
                <div className="flex items-center gap-2 text-surface-600 dark:text-surface-300">
                  <span className="text-lg">💰</span>
                  <span>₹{detail.cost}/person</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
