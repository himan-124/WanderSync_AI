import { useTranslation } from 'react-i18next';

export function TripHeader({ plan }) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'hinglish' : 'en';
    i18n.changeLanguage(nextLng);
  };

  if (!plan) return null;
  
  return (
    <header className="relative rounded-3xl overflow-hidden shadow-premium h-64 md:h-80 transition-shadow hover:shadow-premium-hover" aria-label="Trip header">
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{ backgroundImage: `url('${plan.cover_img}')` }} role="img" aria-label={`Cover image of ${plan.title}`}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden="true"></div>
      
      {/* Language Switcher Overlay */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleLanguage}
          className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold py-2 px-4 rounded-full text-xs hover:bg-white/30 transition-all shadow-lg"
          aria-label={`Switch to ${i18n.language === 'en' ? 'Hinglish' : 'English'}`}
        >
          {i18n.language === 'en' ? 'English | HI' : 'Hinglish | EN'}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 p-8 text-white w-full animate-fade-in-up">
        <span className="text-xs font-black tracking-widest uppercase opacity-80 mb-2 block text-primary-300">Trip Summary</span>
        <h1 className="text-3xl md:text-5xl font-black drop-shadow-md">{plan.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-5" aria-label="Trip details">
          <span className="bg-surface-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm" aria-label={`Dates: ${plan.date_range}`}>{plan.date_range}</span>
          {plan.badges?.map(b => (
            <span key={b} className="bg-primary-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">{b}</span>
          ))}
        </div>
      </div>
    </header>
  );
}
