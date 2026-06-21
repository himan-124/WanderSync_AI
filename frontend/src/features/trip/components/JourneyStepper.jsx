import { JourneyLoading } from '@/components/common/JourneyLoading';

export function JourneyStepper({ steps, activeNode, doneNodes, stageLabel }) {
  return (
    <div className="flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 p-8 min-h-[60vh] w-full">
      <div className="w-full max-w-4xl bg-white dark:bg-surface-900 rounded-3xl shadow-premium p-8 border border-surface-200 dark:border-surface-800">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight">Crafting Your Journey</h2>
          <p className="mt-2 text-surface-600 dark:text-surface-400">Our AI agents are working on your itinerary</p>
        </div>
        <JourneyLoading steps={steps} activeNode={activeNode} doneNodes={doneNodes} />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s, index) => {
            const isDone = doneNodes.includes(s.key);
            const isActive = s.key === activeNode;
            
            let borderClass = 'border-surface-200 dark:border-surface-700 text-surface-400 dark:text-surface-500';
            let bgClass = 'bg-surface-100 dark:bg-surface-800 text-surface-400';
            let iconContent = index + 1;
            
            if (isDone) {
              borderClass = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
              bgClass = 'bg-green-500 text-white';
              iconContent = "✓";
            } else if (isActive) {
              borderClass = 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md text-primary-700 dark:text-primary-300';
              bgClass = 'bg-primary-500 text-white animate-pulse shadow-lg shadow-primary-500/40';
            }
            
            return (
              <div key={s.key} className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${borderClass}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 font-bold text-sm transition-colors duration-300 ${bgClass}`}>
                  {iconContent}
                </span>
                <div>
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-sm opacity-80">{isActive && stageLabel ? stageLabel : s.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
