import React, { useState } from 'react';

function photoUrl(seed, w = 640, h = 440) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

export function Thumb({ photo, seed, alt }) {
  const [err, setErr] = useState(false);
  const src = photo || (seed ? photoUrl(seed, 360, 280) : null);
  if (!src || err) return <div className="flex items-center justify-center bg-surface-200 dark:bg-surface-800 text-surface-400 rounded-xl w-24 h-24 flex-shrink-0" aria-label={alt}>◌</div>;
  return (
    <div className="w-24 h-24 rounded-xl bg-cover bg-center flex-shrink-0 shadow-sm" style={{ backgroundImage: `url('${src}')` }} aria-label={alt} role="img">
      <img src={src} alt="" style={{ display: "none" }} onError={() => setErr(true)} />
    </div>
  );
}

const PERIOD = {
  morning:   { label: "Morning", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  afternoon: { label: "Afternoon", cls: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
  evening:   { label: "Evening", cls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
};

export function AttractionCard({ item, onNearby }) {
  const p = PERIOD[item.period] || PERIOD.morning;
  return (
    <div className="flex-1 min-w-0 pl-6 pb-8 relative group">
      <article className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4">
        <Thumb photo={item.photo} seed={item.seed} alt={item.name} />
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-lg text-surface-900 dark:text-white truncate">{item.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${p.cls}`}>{p.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-surface-600 dark:text-surface-400 mb-2">
            {item.start && <span className="font-medium text-surface-900 dark:text-surface-300" aria-label={`Scheduled for ${item.start}${item.end ? ` to ${item.end}` : ""}`}>{item.start}{item.end ? ` – ${item.end}` : ""}</span>}
            {item.rating != null && <span className="flex items-center text-yellow-600 dark:text-yellow-500 font-medium" aria-label={`Rating ${Number(item.rating).toFixed(1)} stars`}>★ {Number(item.rating).toFixed(1)}</span>}
            {item.cost && <span aria-label={`Cost per person ₹${item.cost}`}>₹{item.cost}/person</span>}
            {item.open && <span className="text-green-600 dark:text-green-500">Opens {item.open}</span>}
          </div>
          {item.address && <div className="text-sm text-surface-500 truncate mb-1">📍 {item.address}</div>}
          {item.tel && <div className="text-sm text-surface-500 truncate mb-1">📞 {item.tel}</div>}
          {item.note && <div className="mt-2 p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-xl text-sm leading-relaxed border border-primary-100 dark:border-primary-800/50" role="note">💡 {item.note}</div>}
          {onNearby && item.location && (
            <button 
              className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700 self-start focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg px-2 py-1 -ml-2" 
              onClick={() => onNearby(item)}
              aria-label={`Find spots nearby ${item.name}`}
            >
              📍 Find Nearby
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

export function MealCard({ item }) {
  const label = item.type === "lunch" ? "Lunch" : "Dinner";
  if (item.no_restaurant) {
    return (
      <div className="flex-1 min-w-0 pl-6 pb-8 relative group">
        <div className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 border-dashed rounded-2xl p-4" role="status">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-second-100 text-second-800 dark:bg-second-900/50 dark:text-second-300 rounded text-xs font-bold uppercase tracking-wider">{label}</span>
            <span className="font-semibold text-surface-700 dark:text-surface-300">No suitable restaurant found nearby</span>
          </div>
          <p className="text-sm text-surface-500">You may need to explore around this area for {label.toLowerCase()} options.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 min-w-0 pl-6 pb-8 relative group">
      <article className="bg-white dark:bg-surface-900 border-2 border-second-100 dark:border-second-900/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-second-50 dark:bg-second-900/20 rounded-bl-[100%] -z-10"></div>
        <Thumb photo={item.photo} seed={item.seed} alt={item.name} />
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-lg text-surface-900 dark:text-white truncate">{item.name}</h4>
            <span className="px-2 py-0.5 bg-second-100 text-second-800 dark:bg-second-900/50 dark:text-second-300 rounded text-xs font-bold uppercase tracking-wider">{label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-surface-600 dark:text-surface-400 mb-2">
            {item.rating != null && <span className="flex items-center text-yellow-600 dark:text-yellow-500 font-medium" aria-label={`Rating ${Number(item.rating).toFixed(1)} stars`}>★ {Number(item.rating).toFixed(1)}</span>}
            {item.cost && <span aria-label={`Cost per person ₹${item.cost}`}>₹{item.cost} /person</span>}
            {item.category && <span className="bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded text-xs">{item.category}</span>}
          </div>
          {item.addr && <div className="text-sm text-surface-500 truncate mb-1">📍 {item.addr}</div>}
          {item.open && <div className="text-sm text-surface-500 truncate mb-1">🕐 {item.open}</div>}
          {item.tel && <div className="text-sm text-surface-500 truncate mb-1">📞 {item.tel}</div>}
          {item.reason && <div className="mt-2 text-sm text-surface-600 dark:text-surface-400 italic" role="note">"{item.reason}"</div>}
        </div>
      </article>
    </div>
  );
}

export function NavRow({ itemA, itemB, onNav, isActive }) {
  const hasCoords = itemA?.location?.lat && itemA?.location?.lng && itemB?.location?.lat && itemB?.location?.lng;
  if (!hasCoords) return null;
  const dist = itemB.dist;
  return (
    <div className="flex relative -mt-4 mb-4 group">
      <div className="w-16 flex-shrink-0 flex items-center justify-end pr-4 text-xs font-semibold text-primary-600 dark:text-primary-400">
        {dist ? `${dist}km` : ""}
      </div>
      <div className="relative flex flex-col items-center">
        <div className="w-0.5 h-full bg-surface-200 dark:bg-surface-800 absolute top-0 bottom-0"></div>
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white dark:bg-surface-950 z-10 transition-colors ${isActive ? 'border-primary-500 text-primary-500 shadow-sm shadow-primary-500/20' : 'border-surface-300 dark:border-surface-700 text-surface-400 group-hover:border-primary-400 group-hover:text-primary-400'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
      </div>
      <div className="flex-1 pl-6 pt-1">
        <button
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${isActive ? "bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800 shadow-sm" : "bg-white text-surface-600 border border-surface-200 hover:border-primary-300 hover:text-primary-600 dark:bg-surface-900 dark:text-surface-400 dark:border-surface-800 dark:hover:border-primary-700"}`}
          onClick={() => onNav({ from: itemA.location, to: itemB.location })}
          aria-label={`Navigate from ${itemA.name} to ${itemB.name}`}
          aria-pressed={isActive}
        >
          <span>Navigate</span>
          <span className="opacity-50 text-xs truncate max-w-[150px] sm:max-w-[200px] hidden sm:inline-block">({itemA.name} → {itemB.name})</span>
        </button>
      </div>
    </div>
  );
}

export function Timeline({ items, onNav, activeNavKey }) {
  return (
    <ul className="pt-4" aria-label="Trip timeline">
      {items.map((item, i) => {
        const isMeal = item.type !== "attraction";
        const prevItem = i > 0 ? items[i - 1] : null;
        const navKey = i > 0 ? String(i) : null;
        return (
          <li key={i}>
            {i > 0 && onNav && (
              <NavRow
                itemA={prevItem}
                itemB={item}
                onNav={(pair) => onNav(activeNavKey === navKey ? null : navKey, pair)}
                isActive={activeNavKey === navKey}
              />
            )}
            <div className="flex relative">
              <div className="w-16 flex-shrink-0 pt-6 pr-4 text-right">
                <span className="text-sm font-bold text-surface-900 dark:text-white">{isMeal ? "" : (item.start || "")}</span>
              </div>
              <div className="relative flex flex-col items-center">
                <div className="w-0.5 h-full bg-surface-200 dark:bg-surface-800 absolute top-0 bottom-0"></div>
                <div className={`w-4 h-4 rounded-full border-4 bg-white dark:bg-surface-950 z-10 mt-6 ${isMeal ? 'border-second-500' : 'border-primary-500'}`}></div>
              </div>
              {isMeal
                ? <MealCard item={item} />
                : <AttractionCard item={item} onNearby={onNav ? (it) => onNav("nearby:" + i, null, it) : undefined} />
              }
            </div>
          </li>
        );
      })}
    </ul>
  );
}
