import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getProfile, getAuth } from '@/services/api';
import { JourneyStepper } from './JourneyStepper';
import { useTripPlanner, JOURNEY_STEPS } from '@/hooks/useTripPlanner';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function PlanPage({ onRequestLogin, currentUsername, onPhaseChange, onPlanReady, modifyTrigger, onManageProfile }) {
  const { t } = useTranslation();
  const {
    phase, query, setQuery, activeNode, doneNodes, stageLabel, missingFields,
    concernModal, errMsg, doStream, startPlan, confirmConcern
  } = useTripPlanner({ onPhaseChange, onPlanReady, currentUsername });

  const [profile, setProfile] = useState(null);
  const concernRef = useFocusTrap(!!concernModal);

  useEffect(() => {
    if (!getAuth()) { setProfile(null); return; }
    getProfile().then(setProfile).catch(() => {});
  }, [currentUsername]);

  useEffect(() => {
    if (modifyTrigger) {
      doStream({ query: modifyTrigger.query, plan_id: modifyTrigger.planId, modification_notes: modifyTrigger.query });
    }
  }, [modifyTrigger, doStream]);

  const handleStartPlan = () => {
    if (!getAuth()) { onRequestLogin && onRequestLogin(); return; }
    startPlan();
  };

  const examples = [
    "A 3-day weekend trip to Kyoto for cherry blossoms",
    "Food tour in Delhi for 2 days",
    "Adventure sports in Manali with family",
  ];

  const profileRows = profile ? [
    { key: "attr", label: "Attractions", cls: "bg-[#7C3AED] text-white", items: profile.attraction_prefs || [] },
    { key: "food", label: "Food", cls: "bg-[#FF4F4F] text-white", items: profile.food_prefs || [] },
    { key: "habit", label: "Habits", cls: "bg-[#00C853] text-white", items: profile.habit_prefs || [] },
  ].filter(r => r.items.length) : [];

  if (phase === "loading") {
    return (
      <main id="main-content" className="min-h-screen bg-[#F4F2EE] font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>
         <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
          `}
        </style>
        <JourneyStepper steps={JOURNEY_STEPS} activeNode={activeNode} doneNodes={doneNodes} stageLabel={stageLabel} />
      </main>
    );
  }

  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-[#F4F2EE] text-[#111]" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
        `}
      </style>
      
      <div className="w-full max-w-4xl relative z-10">
        
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full bg-white border-2 border-black font-bold text-sm mb-6 shadow-[4px_4px_0_0_#FF4F4F]">
            ✨ {t('common.smartest_planner', 'The smartest trip planner')}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            Design your perfect trip <br className="hidden md:block" />
            <span className="text-[#7C3AED]">in seconds.</span>
          </h1>
        </div>

        {/* Profile Section */}
        {profileRows.length > 0 && (
          <section className="mb-8 bg-white border-2 border-black p-6 rounded-3xl shadow-[6px_6px_0_0_#111]" aria-labelledby="profile-vibe-title">
            <div className="flex justify-between items-center mb-6">
              <h3 id="profile-vibe-title" className="font-bold text-xl">Your Travel Vibe</h3>
              <button 
                className="text-sm font-bold text-[#111] border-b-2 border-black hover:text-[#7C3AED] hover:border-[#7C3AED] transition-all" 
                onClick={onManageProfile}
                aria-label="Manage your travel profile"
              >
                Edit Profile
              </button>
            </div>
            <div className="space-y-6">
              {profileRows.map(r => (
                <div key={r.key}>
                  <span className="block text-xs font-black uppercase tracking-wider text-[#666] mb-3">{r.label}</span>
                  <div className="flex flex-wrap gap-2">
                    {r.items.map((it, i) => (
                      <span key={i} className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 border-black shadow-[2px_2px_0_0_#111] ${r.cls}`}>
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Input Box */}
        <section className="bg-white rounded-3xl shadow-[8px_8px_0_0_#111] border-2 border-black overflow-hidden flex flex-col transition-all hover:shadow-[12px_12px_0_0_#111]" aria-labelledby="planner-input-title">
          <div className="p-8">
            <label id="planner-input-title" htmlFor="trip-query" className="block text-2xl font-black text-[#111] mb-6">{t('planner.where_to')}</label>
            <textarea
              id="trip-query"
              className="w-full h-40 rounded-2xl border-2 border-black bg-[#F4F2EE] px-6 py-4 text-lg font-medium focus:bg-white transition-colors outline-none resize-none shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.05)]"
              placeholder={t('planner.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleStartPlan(); }}
              aria-required="true"
            />
            
            {missingFields.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap" role="alert">
                {missingFields.map(f => (
                  <span key={f} className="px-3 py-1 bg-[#FF4F4F] text-white border-2 border-black rounded-full text-xs font-bold shadow-[2px_2px_0_0_#111]">
                    Missing: {f}
                  </span>
                ))}
              </div>
            )}
            
            {errMsg && (
              <div className="mt-6 text-white text-sm font-bold bg-[#111] p-4 rounded-xl border-2 border-red-500 shadow-[4px_4px_0_0_#FF4F4F]" role="alert">
                {errMsg}
              </div>
            )}
          </div>
          
          <div className="bg-[#F4F2EE] p-6 flex flex-col sm:flex-row items-center justify-between border-t-2 border-black gap-6">
            <div className="flex flex-wrap gap-3" role="group" aria-label="Query examples">
              {examples.map((ex) => (
                <button 
                  key={ex} 
                  className="px-4 py-2 bg-white rounded-full text-xs font-bold text-[#111] border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#7C3AED] transition-all" 
                  onClick={() => setQuery(ex)}
                  aria-label={`Try example: ${ex}`}
                >
                  {ex.slice(0, 30)}...
                </button>
              ))}
            </div>
            <button 
              className="w-full sm:w-auto px-10 py-4 bg-[#7C3AED] text-white rounded-full font-black border-2 border-black hover:-translate-y-1 shadow-[6px_6px_0_0_#111] active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shrink-0"
              onClick={handleStartPlan} 
              disabled={!query.trim()}
            >
              {t('planner.generate')}
            </button>
          </div>
        </section>
      </div>
      
      {/* Modal */}
      {concernModal && (
        <div className="fixed inset-0 bg-[#F4F2EE]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div 
            ref={concernRef}
            className="bg-white rounded-3xl max-w-lg w-full p-8 border-2 border-black shadow-[12px_12px_0_0_#FF4F4F]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="concern-title"
          >
            <h3 id="concern-title" className="text-3xl font-black mb-4 text-[#111]">Wait a sec...</h3>
            <p className="text-[#444] font-medium mb-8 text-lg leading-relaxed">{concernModal.concern}</p>
            <div className="flex justify-end gap-4">
              <button 
                className="px-6 py-3 font-bold text-[#111] hover:text-[#FF4F4F] transition-colors" 
                onClick={() => {}}
                aria-label="Cancel modification"
              >
                Cancel
              </button>
              <button 
                className="px-8 py-3 bg-[#111] text-white font-bold rounded-full border-2 border-[#111] shadow-[4px_4px_0_0_#FF4F4F] hover:-translate-y-1 transition-all" 
                onClick={confirmConcern}
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
