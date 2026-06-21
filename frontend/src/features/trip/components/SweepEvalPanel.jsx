import React from 'react';

const GRADERS = [
  { key: "g1_closed_pool",           label: "G1 No Hallucination" },
  { key: "g2_time_check",            label: "G2 Time Check" },
  { key: "g3_proximity",             label: "G3 Location Proximity" },
  { key: "g4_structure",             label: "G4 Structure Valid" },
  { key: "g5_coverage",              label: "G5 Coverage" },
  { key: "g6_weather",               label: "G6 Weather" },
  { key: "g7_convergence",           label: "G7 Convergence" },
  { key: "g8_time_check_efficiency", label: "G8 TC Efficiency" },
];

export function SweepEvalPanel({ code, reviewRounds, timeCheckRounds, profileUpdate, dialogue, overallPass, elapsedS }) {
  const results = code?.results || {};
  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 shadow-sm font-sans">
      <div className={`flex items-center justify-between p-4 rounded-2xl mb-8 ${overallPass ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800" : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"}`}>
        <span className="text-xl font-black">{overallPass ? "✅ Verification Passed" : "❌ Verification Failed"}</span>
        {elapsedS != null && <span className="font-mono bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg text-sm">{elapsedS}s</span>}
      </div>

      <h4 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4">Code Scoring</h4>
      <div className="grid gap-2 mb-8">
        {GRADERS.map(({ key, label }) => {
          const r = results[key];
          if (!r) return null;
          const isNA = !r.passed && r.detail?.includes("Skipped");
          return (
            <React.Fragment key={key}>
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isNA ? "bg-surface-50 border-surface-200 text-surface-500 dark:bg-surface-800/50 dark:border-surface-700" : r.passed ? "bg-green-50/50 border-green-100 text-green-800 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-300" : "bg-red-50/50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-300"}`}>
                <span className="text-xl">{isNA ? "—" : r.passed ? "✅" : "❌"}</span>
                <span className="font-semibold">{label}</span>
              </div>
              {!r.passed && !isNA && <div className="pl-12 pr-4 pb-3 text-sm text-red-600 dark:text-red-400 font-medium">{r.detail}</div>}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700">
          <div className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-1">Review Rounds</div>
          <div className="text-2xl font-black text-surface-900 dark:text-white">{reviewRounds}</div>
        </div>
        <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700">
          <div className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-1">Time Checks</div>
          <div className="text-2xl font-black text-surface-900 dark:text-white">{timeCheckRounds}</div>
        </div>
      </div>

      {profileUpdate && !profileUpdate.error && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4">Profile Update</h4>
          <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 space-y-2">
            {(profileUpdate.diff || []).length > 0
              ? profileUpdate.diff.map((d, i) => <div key={i} className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-start gap-2"><span className="text-primary-500">•</span> {d}</div>)
              : <div className="text-sm italic text-surface-500">No changes detected</div>}
            
            {(profileUpdate.change_log || []).length > 0 && (
              <details className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 group">
                <summary className="text-sm font-semibold text-primary-600 cursor-pointer select-none">Reasoning Log</summary>
                <div className="mt-3 space-y-2 text-sm text-surface-600 dark:text-surface-400">
                  {profileUpdate.change_log.map((c, i) => <p key={i}>{c}</p>)}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {(dialogue || []).length > 0 && (
        <details className="group">
          <summary className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 text-sm font-bold text-surface-700 dark:text-surface-300 cursor-pointer select-none">
            📜 Planning Conversation Log
          </summary>
          <div className="mt-2 bg-white dark:bg-surface-950 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 h-96 overflow-y-auto space-y-4 font-mono text-sm leading-relaxed shadow-inner">
            {dialogue.map((d, i) => <p key={i} className="text-surface-700 dark:text-surface-300 border-b border-surface-100 dark:border-surface-800 pb-4 last:border-0">{d}</p>)}
          </div>
        </details>
      )}
    </div>
  );
}
