import React, { useState } from 'react';
import { motion } from 'framer-motion';

const vibes = [
  { id: 'spiritual', label: 'Spiritual & Calm', icon: '🧘‍♀️' },
  { id: 'adrenaline', label: 'Adrenaline Rush', icon: '🏂' },
  { id: 'aesthetic', label: 'Aesthetic Sunsets', icon: '🌅' },
  { id: 'nightlife', label: 'Late Night Cafes', icon: '☕' },
  { id: 'nature', label: 'Lost in Nature', icon: '🌲' },
];

export default function VibeSelector({ onChange }) {
  const [selectedVibes, setSelectedVibes] = useState([]);

  const toggleVibe = (id) => {
    setSelectedVibes((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
      onChange?.(next);
      return next;
    });
  };

  return (
    <section className="w-full py-6">
      <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4 px-4">
        What&apos;s your vibe for this trip? ✨
      </h3>

      <div className="flex overflow-x-auto gap-3 px-4 pb-4 hide-scrollbar">
        {vibes.map((vibe) => {
          const isSelected = selectedVibes.includes(vibe.id);

          return (
            <motion.button
              key={vibe.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleVibe(vibe.id)}
              type="button"
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 shadow-sm min-w-[180px] ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-primary-500/30'
                  : 'bg-white text-surface-900 hover:bg-surface-100 border border-surface-200 dark:bg-surface-900 dark:text-surface-100 dark:border-surface-700'
              }`}
            >
              <span className="text-lg">{vibe.icon}</span>
              <span>{vibe.label}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
