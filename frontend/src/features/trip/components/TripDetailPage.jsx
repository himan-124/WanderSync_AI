import { useState, useEffect } from 'react';
import { Timeline } from './TripTimeline';
import { MapPanel } from './MapPanel';
import { NearbySearchModal } from './NearbySearchModal';
import { TripHeader } from './TripHeader';
import { DayTabs } from './DayTabs';
import { TripNotes } from './TripNotes';
import { useTripEditing } from '@/hooks/useTripEditing';
import { savePlanMetadata } from '@/services/api';

export function TripDetailPage({ plan: planProp, planId: planIdProp, onRequestModify, onRequestLogin, currentUsername }) {
  const {
    plan, planId, 
    optimizingDay, optimizedDays, dayMsg,
    handleOptimize, handleRevert,
    editing, saving, saveErr,
    enterEdit, exitEdit, saveEdit, applyEdit, undo, redo,
    undoCount, redoCount,
    editedView, draft, searchTarget, setSearchTarget
  } = useTripEditing(planProp, planIdProp, currentUsername);

  const [dayIdx, setDayIdx] = useState(0);
  const [activeNavKey, setActiveNavKey] = useState(null);
  const [activeNavPair, setActiveNavPair] = useState(null);
  const [nearbyTarget, setNearbyTarget] = useState(null);
  const [themeInput, setThemeInput] = useState('');
  
  // Local notes state for TripNotes
  const [metaDirty, setMetaDirty] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);

  useEffect(() => {
    setDayIdx(0);
    setActiveNavKey(null);
    setActiveNavPair(null);
    setNearbyTarget(null);
  }, [planIdProp]);

  useEffect(() => {
    if (editing && draft) setThemeInput(draft[dayIdx]?.theme || '');
  }, [editing, dayIdx, draft]);

  const handleNav = (key, pair, nearbyItem) => {
    if (nearbyItem) {
      setNearbyTarget({ location: nearbyItem.location, name: nearbyItem.name, dayI: dayIdx, idx: Number(key.split(':')[1]) });
      return;
    }
    if (key === activeNavKey) {
      setActiveNavKey(null); setActiveNavPair(null);
    } else {
      setActiveNavKey(key); setActiveNavPair(pair);
    }
  };

  const handlePoiPick = (poi) => {
    const { dayI, idx, addType } = searchTarget;
    setSearchTarget(null);
    applyEdit(d => {
      const tl = d[dayI].timeline;
      if (idx != null) {
        const old = tl[idx];
        if (old.type === 'attraction') {
          tl[idx] = { ...old, name: poi.name, rating: poi.rating ?? null,
            open_time: poi.open_time ?? null, location: poi.location,
            photo: poi.photo ?? null, tip: null };
        } else {
          tl[idx] = { type: old.type, name: poi.name, rating: poi.rating ?? null,
            cost: poi.cost ?? null, address: poi.address ?? null,
            location: poi.location, photo: poi.photo ?? null,
            reason: null, no_restaurant: false };
        }
      } else if (addType === 'attraction') {
        tl.push({ type: 'attraction', name: poi.name, rating: poi.rating ?? null,
          open_time: poi.open_time ?? null, location: poi.location,
          photo: poi.photo ?? null, tip: null,
          start_time: null, end_time: null, period: 'afternoon' });
      } else {
        tl.push({ type: addType, name: poi.name, rating: poi.rating ?? null,
          cost: poi.cost ?? null, address: poi.address ?? null,
          location: poi.location, photo: poi.photo ?? null,
          reason: null, no_restaurant: false });
      }
    });
  };

  const handleUpdateField = (field, value) => {
    plan[field] = value;
    setMetaDirty(true);
  };

  const handleSaveMeta = async () => {
    if (!planId) return;
    setMetaSaving(true);
    try {
      await savePlanMetadata(planId, { hotel: plan.hotel_info, notes: plan.general_notes });
      setMetaDirty(false);
    } catch (e) { alert(e.message || 'Failed to save notes'); }
    finally { setMetaSaving(false); }
  };

  if (!plan) return null;
  const viewPlan = editing && editedView ? editedView : plan;
  const day = viewPlan.days[dayIdx];
  const dayNo = dayIdx + 1;
  const hasAttractions = (day.items || []).filter(it => it.type === 'attraction').length >= 2;
  const isOptimized = optimizedDays[dayIdx] !== undefined;

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-[#F4F2EE] text-[#111] p-4 md:p-8 animate-fade-in" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
        `}
      </style>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Aesthetic Wrap for Header */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[6px_6px_0_0_#7C3AED]">
          <TripHeader plan={plan} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <DayTabs days={viewPlan.days} activeDay={dayIdx} setActiveDay={(i) => { setDayIdx(i); setActiveNavKey(null); setActiveNavPair(null); }} />

            <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[8px_8px_0_0_#111]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-black/10">
                {editing ? (
                  <input
                    className="text-2xl font-black bg-[#F4F2EE] border-2 border-black rounded-xl px-4 py-3 focus:ring-0 transition-all outline-none w-full sm:w-2/3 shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.05)] focus:bg-white"
                    value={themeInput}
                    onChange={e => setThemeInput(e.target.value)}
                    onBlur={() => {
                      const cur = draft[dayIdx]?.theme || '';
                      if (themeInput !== cur) applyEdit(d => { d[dayIdx].theme = themeInput; });
                    }}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                  />
                ) : (
                  <h3 className="text-3xl font-black text-[#111]">{day.theme}</h3>
                )}
                
                <div className="flex gap-2">
                  {!editing && planId && (
                    <button 
                      className="px-6 py-2 bg-white text-[#111] font-bold rounded-full border-2 border-black shadow-[4px_4px_0_0_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#7C3AED] transition-all" 
                      onClick={enterEdit}
                    >
                      Edit Trip
                    </button>
                  )}
                  {!editing && hasAttractions && planId && (
                    isOptimized ? (
                      <button 
                        className="px-6 py-2 bg-[#FF4F4F] text-white font-bold rounded-full border-2 border-black shadow-[4px_4px_0_0_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#111] transition-all" 
                        onClick={() => handleRevert(dayNo)}
                      >
                        Undo Optimize
                      </button>
                    ) : (
                      <button 
                        className="px-6 py-2 bg-[#7C3AED] text-white font-bold rounded-full border-2 border-black shadow-[4px_4px_0_0_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#111] transition-all disabled:opacity-50" 
                        disabled={optimizingDay === dayNo} 
                        onClick={() => handleOptimize(dayNo)}
                      >
                        {optimizingDay === dayNo ? 'Optimizing...' : 'Optimize Route'}
                      </button>
                    )
                  )}
                </div>
              </div>

              {dayMsg && dayMsg.day === dayNo && (
                <div className="mb-6 p-4 bg-[#7C3AED] text-white border-2 border-black rounded-2xl text-sm font-bold shadow-[4px_4px_0_0_#111] animate-pulse">
                  {dayMsg.text}
                </div>
              )}

              <div className="space-y-6" role="tabpanel" id={`day-panel-${dayIdx}`} aria-labelledby={`day-tab-${dayIdx}`}>
                <Timeline items={day.items || []} onNav={handleNav} activeNavKey={activeNavKey} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="h-[400px] lg:h-[500px] sticky top-8 rounded-3xl overflow-hidden shadow-[8px_8px_0_0_#111] border-2 border-black bg-white">
              <MapPanel day={day} dayIdx={dayIdx} navPair={activeNavPair} onNavClear={() => { setActiveNavKey(null); setActiveNavPair(null); }} />
            </div>
            
            <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[8px_8px_0_0_#FF4F4F]">
              <TripNotes plan={plan} onUpdateField={handleUpdateField} />
            </div>
            
            {metaDirty && (
              <button 
                className="w-full px-6 py-4 bg-[#111] text-white font-bold rounded-full border-2 border-[#111] shadow-[6px_6px_0_0_#7C3AED] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#7C3AED] transition-all disabled:opacity-50"
                disabled={metaSaving} 
                onClick={handleSaveMeta}
              >
                {metaSaving ? 'Saving Notes...' : 'Save Notes ✨'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {nearbyTarget && (
        <NearbySearchModal 
          location={nearbyTarget.location} 
          name={nearbyTarget.name} 
          onClose={() => setNearbyTarget(null)} 
          onPickMeal={(poi, type) => {
            setSearchTarget({ dayI: nearbyTarget.dayI, addType: type });
            handlePoiPick(poi);
            setNearbyTarget(null);
          }} 
        />
      )}
    </div>
  );
}
