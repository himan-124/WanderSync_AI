import { MapPin, Info } from 'lucide-react';

export function TripNotes({ plan, onUpdateField }) {
  if (!plan) return null;

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-surface-900 dark:text-white">
          <MapPin className="text-primary-500" size={24} /> Accommodation
        </h3>
        <textarea
          className="w-full h-32 p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:text-white text-sm transition-all resize-none outline-none"
          placeholder="Where are you staying? (e.g., Shinjuku Prince Hotel, Tokyo)"
          value={plan.hotel_info || ""}
          onChange={(e) => onUpdateField('hotel_info', e.target.value)}
        />
      </div>

      <div className="card">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-surface-900 dark:text-white">
          <Info className="text-primary-500" size={24} /> General Notes
        </h3>
        <textarea
          className="w-full h-48 p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:text-white text-sm transition-all resize-none outline-none"
          placeholder="Important reminders, packing list, or travel tips..."
          value={plan.general_notes || ""}
          onChange={(e) => onUpdateField('general_notes', e.target.value)}
        />
      </div>
    </div>
  );
}
