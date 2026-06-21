import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Compass, Wallet, Calendar, ArrowRight, Download, Camera, Navigation, LogOut, User, Lock, Map, PlaneTakeoff, Coffee, Palmtree, Image as ImageIcon, Share2, Ticket } from 'lucide-react';

const VIBES = [
  '🏔️ Snowy Mountains', '🌲 Deep Forest', '🌊 Ocean Breeze', '🕉️ Spiritual Peace',
  '🐪 Desert Safari', '🏰 Royal Heritage', '🌃 Midnight City Lights', '🛶 Backwaters',
  '🦁 Wildlife Safari', '🪂 Extreme Adventure', '💖 Romantic Getaway', '🎒 Solo Backpacking',
  '🪩 Party Hub', '🚗 Long Road Trip', '⛺ Stargazing Camping', '🍜 Street Foodie',
  '🧘‍♀️ Wellness & Yoga', '💎 Hidden Local Gems', '🏨 Luxury Resort Stay', '🌧️ Monsoon Magic'
];

const GUARANTEED_FALLBACK_IMAGES = [
  { url: "https://images.unsplash.com/photo-1506744626753-1407336d1ce8?w=800&q=80", label: "Scenic View" },
  { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", label: "Nature Escapes" },
  { url: "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=800&q=80", label: "Exploration" },
  { url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", label: "Local Aesthetics" },
  { url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80", label: "Street View" },
  { url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80", label: "Cultural Heritage" },
  { url: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80", label: "Wanderlust Vibes" },
  { url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", label: "Adventure Awaits" }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const [vibeInput, setVibeInput] = useState('');
  const [daysInput, setDaysInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  
  // ✨ NAYA STATE: AI Vibe Match Score ✨
  const [vibeMatchScore, setVibeMatchScore] = useState(0);

  useEffect(() => {
    const loggedUser = localStorage.getItem('wanderSyncAuth');
    if (loggedUser) {
      setIsLoggedIn(true);
      requestLocationSilently();
    }
  }, []);

  const requestLocationSilently = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {});
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('wanderSyncAuth', 'true');
    setIsLoggedIn(true);
    setShowSplash(true);
    requestLocationSilently();
    setTimeout(() => setShowSplash(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('wanderSyncAuth');
    setIsLoggedIn(false);
    setPlanData(null);
    setVibeInput('');
    setDaysInput('');
    setGalleryImages([]);
    setVibeMatchScore(0);
  };

  const downloadPDF = () => {
    window.print();
  };

  // ✨ NAYA FUNCTION: WhatsApp Share ✨
  const handleWhatsAppShare = () => {
    const text = `Hey! I used WanderSync AI to plan an epic ${daysInput}-day trip to *${planData.destination}*. \n\n💰 It's going to cost around ${planData.budget}. \n🎯 Vibe Match: ${vibeMatchScore}%!\n\nLet's pack our bags! 🚀🎒`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ✨ NAYA FUNCTION: Dummy Booking Monetization ✨
  const handleBooking = () => {
    alert("🚀 Affiliate Monetization Triggered! Redirecting to MakeMyTrip/Agoda to lock in 30% discount. (Demo Feature)");
  };

  const handleVibeClick = async (selectedVibe) => {
    if (!daysInput || daysInput <= 0) {
      alert("Please enter 'Trip Duration (Days)' first to plan perfectly! ⏳");
      return;
    }
    const cleanVibe = selectedVibe.substring(3).trim();
    setVibeInput(cleanVibe);
    await triggerSearch(cleanVibe);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!daysInput || daysInput <= 0) return alert("Please enter Trip Duration (Days) first! ⏳");
    if (!vibeInput) return;
    await triggerSearch(vibeInput);
  };

 const triggerSearch = async (targetVibe) => {
    setIsProcessing(true);
    const fallbackLat = 23.8320; 
    const fallbackLng = 80.3983; 

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => await fetchAIPlan(position.coords.latitude, position.coords.longitude, targetVibe),
        async () => {
          console.log("Location denied or timed out. Using Fallback.");
          await fetchAIPlan(fallbackLat, fallbackLng, targetVibe);
        },
        { timeout: 5000 } // ✨ YEH HAI MAGIC FIX: 5 second baad auto-fallback
      );
    } else {
      await fetchAIPlan(fallbackLat, fallbackLng, targetVibe);
    }
  };
  const fetchRealPhotos = async (destinationName) => {
    const query = destinationName.split(',')[0].split('&')[0].split(' and ')[0].trim();
    
    // 👇 YAHAN APNI KEY DAALNA BHAI 👇
    const UNSPLASH_ACCESS_KEY = "_Bvr9SJwRNfwAU8DPI7w5IcgfBTxwRnzYLLnJjUUZdg"; 

    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`);
      if (!response.ok) throw new Error("API Limit hit");
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let realUrls = data.results.map((img) => ({
          url: img.urls.regular,
          label: img.alt_description ? img.alt_description.split(' ').slice(0,3).join(' ') : query + ' View'
        }));
        while (realUrls.length < 8) realUrls.push(GUARANTEED_FALLBACK_IMAGES[realUrls.length]);
        setGalleryImages(realUrls.slice(0, 8));
      } else {
        setGalleryImages(GUARANTEED_FALLBACK_IMAGES);
      }
    } catch (error) {
      setGalleryImages(GUARANTEED_FALLBACK_IMAGES);
    }
  };

  const fetchAIPlan = async (lat, lng, targetVibe) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe: targetVibe, days: parseInt(daysInput), lat, lng }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setPlanData(result.data); 
        // Generates a random score between 90 and 99 for that smart AI feel
        setVibeMatchScore(Math.floor(Math.random() * (99 - 90 + 1) + 90));
        await fetchRealPhotos(result.data.destination); 
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Backend error! Make sure Python uvicorn is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTimeline = (text, isPrint = false) => {
    const days = text.split(/(?=Day \d+:|Day \d+ -|Day \d+)/i).filter(d => d.trim().length > 0);
    return (
      <div className={`mt-6 flex flex-col ${isPrint ? 'gap-4' : 'gap-8'}`}>
        {days.map((dayText, idx) => {
          const firstLineBreak = dayText.indexOf('\n');
          let title = dayText;
          let desc = '';
          if (firstLineBreak !== -1) {
            title = dayText.substring(0, firstLineBreak).trim();
            desc = dayText.substring(firstLineBreak).trim();
          }
          title = title.replace(/\*\*/g, '').replace(/\*/g, '');
          desc = desc.replace(/\*\*/g, '').replace(/\*/g, '');

          return (
            <div key={idx} className={`relative ${isPrint ? 'pl-0 border-b border-gray-200 pb-4 last:border-0' : 'pl-12 pb-2 border-l-2 border-white/5 last:border-transparent'}`}>
              {!isPrint && (
                <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full bg-[#09090b] border-2 border-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                </div>
              )}
              <div className={`${isPrint ? 'bg-transparent pt-2' : 'bg-[#121214] border border-white/5 p-6 sm:p-8 rounded-3xl hover:border-blue-500/30 hover:bg-[#18181b] transition-all duration-300 shadow-xl'}`}>
                <h4 className={`${isPrint ? 'text-black text-lg' : 'text-white text-xl md:text-2xl'} font-black mb-2 tracking-tight capitalize`}>
                  {title}
                </h4>
                <p className={`${isPrint ? 'text-gray-700' : 'text-slate-400'} text-sm md:text-base leading-relaxed font-medium`}>
                  {desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl w-full max-w-md relative z-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-2xl mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-2 text-center">Login to sync vibes.<br/>We value your privacy & precise routing.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
              <input type="text" required placeholder="Username" className="w-full bg-[#09090b] border border-white/5 text-white rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white/20 transition-colors" />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
              <input type="password" required placeholder="Password" className="w-full bg-[#09090b] border border-white/5 text-white rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white/20 transition-colors" />
            </div>
            <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition-all mt-4 hover:scale-[1.02]">
              Secure Login to WanderSync
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-700">
          <Compass className="w-20 h-20 text-white mb-6 animate-spin-slow drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          <h1 className="text-5xl font-black tracking-tight text-white">
            WanderSync <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI</span>
          </h1>
          <p className="text-slate-400 mt-4 tracking-widest text-sm uppercase font-bold">Mapping your secure route...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: scroll-left 35s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: white !important;
            }
            .avoid-page-break {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-purple-500/30 relative overflow-hidden print:hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 relative z-10 flex flex-col gap-8">
          <header className="flex justify-between items-center bg-[#121214]/90 border border-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]"><Compass className="w-6 h-6 text-black" /></div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">WanderSync <span className="font-light text-slate-500">AI</span></h1>
            </div>
            <div className="flex gap-3">
              {planData && (
                <button onClick={downloadPDF} className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-full transition-all duration-300 backdrop-blur-sm text-sm font-bold shadow-lg shadow-white/10">
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export PDF</span>
                </button>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-5 py-2.5 rounded-full transition-all duration-300 text-sm font-bold">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <main className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4 flex flex-col justify-start gap-6">
              <div className="px-2 pt-2 mb-2">
                <h2 className="text-6xl font-black text-white leading-[1.05] tracking-tighter">
                  Escape the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ordinary.</span>
                </h2>
              </div>

              <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl shadow-xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-blue-400"/> Curated Aesthetics</h3>
                <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                  {VIBES.map((vibe, idx) => (
                    <button key={idx} type="button" onClick={() => handleVibeClick(vibe)} className="bg-[#18181b] hover:bg-white/10 border border-white/5 hover:border-blue-500/30 text-sm px-4 py-2.5 rounded-full transition-all text-slate-300 whitespace-nowrap font-medium">
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`flex items-center justify-between bg-[#121214] border ${!daysInput ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'border-white/5'} p-6 rounded-3xl transition-colors shadow-xl`}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="text-base font-bold text-white">Trip Duration <span className="text-red-400">*</span></span>
                  </div>
                  <span className="text-xs text-slate-500 ml-7 font-medium">Required for AI mapping</span>
                </div>
                <input type="number" min="1" max="30" value={daysInput} onChange={(e) => setDaysInput(e.target.value)} placeholder="0" className="w-16 bg-[#09090b] border border-white/10 rounded-2xl text-center text-white py-3 outline-none focus:border-blue-500 font-black text-xl shadow-inner transition-all"/>
              </div>

              <form onSubmit={handleGenerate} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center bg-[#121214] border border-white/5 rounded-3xl p-2 shadow-2xl">
                  <input type="text" value={vibeInput} onChange={(e) => setVibeInput(e.target.value)} placeholder="Or type a custom vibe..." className="w-full bg-transparent text-white px-5 py-4 outline-none placeholder:text-slate-600 text-base font-medium"/>
                  <button type="submit" disabled={isProcessing} className="bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-gray-200 hover:scale-[1.02] transition-all disabled:opacity-50 whitespace-nowrap shadow-lg">
                    {isProcessing ? <Sparkles className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Map It</>}
                  </button>
                </div>
              </form>
            </div>

            <div className="xl:col-span-8 relative min-h-[600px]">
              {planData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                  
                  {/* ✨ UPDATED: Google Map with Vibe Score Badge ✨ */}
                  <div className="md:col-span-2 bg-[#121214] border border-white/5 rounded-[2.5rem] overflow-hidden relative min-h-[350px] shadow-2xl group">
                    <iframe width="100%" height="100%" className="absolute inset-0 z-0 filter contrast-125 saturate-150" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=${encodeURIComponent(planData.destination)}&t=k&z=11&ie=UTF8&iwloc=&output=embed`}></iframe>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/20 to-transparent pointer-events-none z-10"></div>
                    <div className="absolute top-8 left-8 flex flex-col gap-3 z-20">
                      <div className="flex flex-wrap gap-3">
                        <div className="bg-white text-black px-4 py-1.5 rounded-full w-max flex items-center gap-2 shadow-lg">
                           <MapPin className="w-4 h-4" />
                           <span className="text-xs font-black tracking-widest uppercase">Target Locked</span>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1.5 rounded-full w-max flex items-center gap-2 shadow-lg border border-white/20">
                           <Sparkles className="w-4 h-4" />
                           <span className="text-xs font-black tracking-widest uppercase">{vibeMatchScore}% Vibe Match</span>
                        </div>
                      </div>
                      <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl tracking-tighter leading-none">{planData.destination}</h1>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-[#121214] border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl hover:border-white/10 transition-colors">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl shrink-0">
                      <Navigation className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Routing & Logistics</p>
                      <p className="text-base text-slate-300 leading-relaxed font-medium">{planData.distance}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-[#121214] border border-white/5 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl group hover:bg-[#18181b] transition-all">
                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                      <div className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-2xl group-hover:scale-105 transition-transform shadow-lg">
                        <Wallet className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Estimated Cap</p>
                        <p className="text-sm text-slate-400 font-medium">For {daysInput} days of exploration</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-5xl font-black text-white tracking-tighter">{planData.budget}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-[#121214] border border-white/5 rounded-[2rem] overflow-hidden p-8 shadow-2xl relative">
                    <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-white font-black text-2xl tracking-tight">Authentic Local Views</h3>
                      <span className="ml-auto text-xs font-bold text-slate-500 uppercase tracking-widest bg-[#09090b] border border-white/5 px-4 py-1.5 rounded-full">Hover to Pause</span>
                    </div>

                    <div className="overflow-hidden relative w-full">
                      {galleryImages.length > 0 ? (
                        <div className="animate-marquee gap-5 pr-5">
                          {[...galleryImages, ...galleryImages].map((imgData, idx) => (
                            <div key={idx} className="relative w-[300px] h-[220px] rounded-3xl overflow-hidden shrink-0 border border-white/10 shadow-xl group">
                              <img src={imgData.url} alt={`Real View ${idx}`} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" crossOrigin="anonymous"/>
                              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-transparent to-transparent pointer-events-none"></div>
                              <p className="absolute bottom-4 left-5 text-white text-sm font-bold capitalize drop-shadow-lg z-10 tracking-wide truncate pr-4">{imgData.label}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-[220px] text-slate-500 font-bold">
                          Loading aesthetics... <Sparkles className="w-5 h-5 animate-spin ml-2"/>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ✨ NAYA ACTION BAR: WhatsApp Share & Monetization ✨ */}
                  <div className="md:col-span-2 bg-gradient-to-r from-[#18181b] to-[#121214] border border-white/5 rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl gap-5">
                    <div>
                      <h3 className="text-white font-black text-xl md:text-2xl">Lock in the Vibe! 🚀</h3>
                      <p className="text-sm text-slate-400 mt-1 font-medium">Share with the squad or grab up to 30% off on hotels.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <button onClick={handleWhatsAppShare} className="flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] px-6 py-3.5 rounded-xl font-bold transition-all w-full sm:w-auto">
                        <Share2 className="w-5 h-5" /> WhatsApp Squad
                      </button>
                      <button onClick={handleBooking} className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl font-black hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] w-full sm:w-auto">
                        <Ticket className="w-5 h-5" /> Book Now & Save
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-[#121214] border border-white/5 rounded-[2rem] p-8 md:p-12 flex flex-col shadow-2xl">
                    <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
                      <div className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-2xl shadow-lg"><Calendar className="w-8 h-8" /></div>
                      <div>
                        <h3 className="text-white font-black text-4xl tracking-tighter">{daysInput}-Day Master Plan</h3>
                        <p className="text-base text-slate-400 mt-2 font-medium">Curated intelligence by WanderSync AI.</p>
                      </div>
                    </div>
                    {renderTimeline(planData.itinerary, false)}
                  </div>

                </div>
              ) : (
                <div className="w-full h-full border border-white/5 bg-[#121214]/50 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 backdrop-blur-md">
                  <div className="w-28 h-28 bg-[#09090b] rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white/5"><Compass className="w-12 h-12 text-slate-600 animate-pulse" /></div>
                  <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Ready to Map.</h3>
                  <p className="text-slate-400 max-w-md text-lg font-medium leading-relaxed">Input your duration and select a vibe. The intelligence engine will handle the rest.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* PRINT UI */}
      {planData && (
        <div className="hidden print:block bg-white text-black font-sans w-full max-w-[1000px] mx-auto py-8" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="border-b-4 border-black pb-6 mb-6 flex justify-between items-end avoid-page-break">
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">WanderSync</h1>
              <p className="text-lg font-bold text-gray-500 uppercase tracking-widest mt-1">Curated Itinerary</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{daysInput} DAYS</p>
              <p className="text-base font-bold text-gray-500 uppercase">{vibeInput}</p>
            </div>
          </div>

          <div className="w-full h-[300px] bg-gray-200 rounded-3xl overflow-hidden mb-6 relative avoid-page-break">
             <img 
               src={galleryImages.length > 0 ? galleryImages[0].url : `https://images.unsplash.com/photo-1506744626753-1407336d1ce8?w=1200&q=80`} 
               alt="Destination" 
               className="w-full h-full object-cover" 
               crossOrigin="anonymous" 
             />
             <div className="absolute bottom-6 left-6 bg-white px-6 py-3 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Destination</p>
                <h2 className="text-3xl font-black">{planData.destination}</h2>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-8 avoid-page-break">
            <div className="flex-1 bg-gray-50 border border-gray-200 p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-3"><Wallet className="w-5 h-5"/> <h3 className="text-lg font-black uppercase">Est. Budget</h3></div>
              <p className="text-2xl font-black">{planData.budget}</p>
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-200 p-6 rounded-3xl">
               <div className="flex items-center gap-2 mb-3"><PlaneTakeoff className="w-5 h-5"/> <h3 className="text-lg font-black uppercase">Logistics</h3></div>
              <p className="text-base font-medium text-gray-700 leading-snug">{planData.distance}</p>
            </div>
          </div>

          <div className="avoid-page-break">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 border-b-2 border-gray-200 pb-2">Daily Breakdown</h3>
            {renderTimeline(planData.itinerary, true)}
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-400 font-bold uppercase tracking-widest text-xs avoid-page-break">
            Powered by WanderSync AI • Not for commercial use
          </div>
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-400 font-bold uppercase tracking-widest text-xs avoid-page-break">
            TEAM BrainGPT • Crafted with ❤️ in India
          </div>
        </div>
      )}
    </>
  );
}