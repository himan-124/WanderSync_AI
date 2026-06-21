import React, { useState, useEffect } from 'react';
import { searchNearby } from '@/services/api';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function NearbySearchModal({ location, name, onClose, onPickMeal }) {
  const [tab, setTab] = useState("attraction");
  const [radius, setRadius] = useState(1500);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const containerRef = useFocusTrap(true);

  const doSearch = async (t, r) => {
    setLoading(true); setErr(""); setResults(null);
    try {
      const res = await searchNearby(location.lat, location.lng, t === "attraction" ? "Attractions" : "Restaurants", r);
      setResults(res);
      if (!res.length) setErr("Nothing found nearby, try expanding the radius.");
    } catch (e) { setErr(e.message || "Search failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { doSearch(tab, radius); }, [tab, radius]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/80 p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={containerRef}
        className="bg-white dark:bg-surface-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nearby-modal-title"
      >
        <div className="p-6 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <h3 id="nearby-modal-title" className="text-xl font-bold text-surface-900 dark:text-white truncate pr-4">📍 Nearby {name}</h3>
          <button 
            className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-4 bg-surface-50 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800">
          <div className="flex gap-2 mb-4 bg-surface-200/50 dark:bg-surface-800/50 p-1 rounded-xl" role="tablist">
            <button 
              role="tab"
              aria-selected={tab === "attraction"}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === "attraction" ? "bg-white dark:bg-surface-700 shadow-sm text-primary-600 dark:text-primary-400" : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"}`} 
              onClick={() => setTab("attraction")}
            >
              Attractions
            </button>
            <button 
              role="tab"
              aria-selected={tab === "restaurant"}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === "restaurant" ? "bg-white dark:bg-surface-700 shadow-sm text-second-600 dark:text-second-400" : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"}`} 
              onClick={() => setTab("restaurant")}
            >
              Restaurants
            </button>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Search radius">
            {[500, 1000, 1500, 3000].map(r => (
              <button 
                key={r} 
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${radius === r ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-300" : "bg-white border-surface-200 text-surface-600 hover:border-primary-300 dark:bg-surface-900 dark:border-surface-700 dark:text-surface-400 dark:hover:border-primary-700"}`} 
                onClick={() => setRadius(r)}
                aria-label={`Search within ${r >= 1000 ? `${r/1000}km` : `${r}m`}`}
              >
                {r >= 1000 ? `${r/1000}km` : `${r}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1" aria-live="polite">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-surface-500">
              <div className="w-8 h-8 border-4 border-surface-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
              <p>Searching nearby area...</p>
            </div>
          )}
          
          {err && !loading && (
            <div className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-xl text-center font-medium" role="alert">
              {err}
            </div>
          )}

          {!loading && !err && results && (
            <div className="space-y-3">
              {results.map((p, i) => (
                <div key={i} className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                  <h4 className="font-bold text-surface-900 dark:text-white mb-1">{p.name}</h4>
                  <div className="flex flex-wrap gap-2 text-sm text-surface-600 dark:text-surface-400 mb-3">
                    {p.rating != null && <span className="flex items-center text-yellow-600 font-medium" aria-label={`Rating ${Number(p.rating).toFixed(1)} stars`}>★ {Number(p.rating).toFixed(1)}</span>}
                    {p.distance != null && <span>• {p.distance}m away</span>}
                    {p.address && <span className="truncate max-w-[200px]">• {p.address}</span>}
                  </div>
                  {tab === "restaurant" && onPickMeal && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 bg-second-50 text-second-700 dark:bg-second-900/30 dark:text-second-400 hover:bg-second-100 dark:hover:bg-second-900/50 rounded-lg text-sm font-semibold transition-colors" onClick={() => onPickMeal(p, "lunch")}>
                        Set as Lunch
                      </button>
                      <button className="flex-1 py-1.5 bg-second-50 text-second-700 dark:bg-second-900/30 dark:text-second-400 hover:bg-second-100 dark:hover:bg-second-900/50 rounded-lg text-sm font-semibold transition-colors" onClick={() => onPickMeal(p, "dinner")}>
                        Set as Dinner
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
