export function DayTabs({ days, activeDay, setActiveDay }) {
  if (!days || days.length === 0) return null;
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide pt-2" role="tablist" aria-label="Trip days">
      {days.map((d, i) => {
        const isActive = activeDay === i;
        return (
          <button
            key={i}
            role="tab"
            aria-selected={isActive}
            aria-controls={`day-panel-${i}`}
            id={`day-tab-${i}`}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border-2 transition-all duration-300 font-bold ${
              isActive 
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 shadow-md transform -translate-y-1' 
                : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-500 hover:border-primary-300 hover:bg-surface-50 dark:hover:bg-surface-700'
            }`}
            onClick={() => setActiveDay(i)}
            aria-label={`${d.day_label || `Day ${i + 1}`}, ${d.date_str}`}
          >
            <span className="text-sm opacity-80 uppercase tracking-widest mb-1" aria-hidden="true">{d.day_label || `Day ${i + 1}`}</span>
            <span className="text-xl" aria-hidden="true">{d.date_str}</span>
          </button>
        );
      })}
    </div>
  );
}
