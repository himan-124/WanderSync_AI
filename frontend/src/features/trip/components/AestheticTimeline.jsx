import React from 'react';
import { motion } from 'framer-motion';

const itineraryData = [
  {
    id: 1,
    time: '10:00 AM',
    title: 'Brunch at Art Cafe',
    type: 'Food',
    desc: 'Amazing vintage aesthetics, try their iced matcha.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
  },
  {
    id: 2,
    time: '02:00 PM',
    title: 'Hidden Waterfall Hike',
    type: 'Adventure',
    desc: 'A bit steep but completely empty. Perfect for reels.',
    image: 'https://images.unsplash.com/photo-1432405972618-c600f5171171?w=400&q=80',
  },
  {
    id: 3,
    time: '06:30 PM',
    title: 'Sunset Point Jamming',
    type: 'Chill',
    desc: 'Local indie musicians usually play here around evening.',
  },
];

export default function AestheticTimeline({ items = itineraryData, title = 'Day 1: The Escape' }) {
  return (
    <section className="max-w-2xl mx-auto p-4 md:p-8 bg-surface-50 dark:bg-surface-900 rounded-[2rem] min-h-screen">
      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-8">
        {title}
      </h2>

      <div className="relative border-l-2 border-purple-200 dark:border-purple-900/50 ml-4 space-y-10">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="relative pl-6"
          >
            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-purple-500 ring-4 ring-purple-100 dark:ring-surface-900 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />

            <div className="bg-white dark:bg-surface-800 p-5 rounded-[1.5rem] shadow-xl shadow-surface-200/40 dark:shadow-none border border-surface-200 dark:border-surface-700 hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
              <span className="text-xs font-bold tracking-widest text-purple-500 uppercase mb-1 block">
                {item.time} • {item.type}
              </span>
              <h4 className="text-xl font-bold text-surface-900 dark:text-white mb-2">{item.title}</h4>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">{item.desc}</p>

              {item.image && (
                <div className="w-full h-40 rounded-3xl overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
