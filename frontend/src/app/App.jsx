import { useState } from 'react';
import { Sparkles, MapPin, Compass, Wallet, Calendar, ArrowRight, Download, Camera, Navigation } from 'lucide-react';

export default function App() {
  const [vibeInput, setVibeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [planData, setPlanData] = useState(null); // Ab pura object store karenge

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!vibeInput) return;
    setIsProcessing(true);

    // Live Location Fetch karna
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchAIPlan(position.coords.latitude, position.coords.longitude);
        },
        async (error) => {
          console.log("Location permission denied, proceeding without location.");
          await fetchAIPlan(null, null); // Bina location ke plan
        }
      );
    } else {
      await fetchAIPlan(null, null);
    }
  };

  const fetchAIPlan = async (lat, lng) => {
    try {
      const response = await fetch('[http://127.0.0.1:8000/generate-plan](http://127.0.0.1:8000/generate-plan)', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe: vibeInput, days: 3, lat, lng }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setPlanData(result.data); // AI ka real JSON data set kar diya
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Backend error:", error);
      alert("Backend se connect nahi ho pa raha!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-purple-500/30 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 relative z-10 flex flex-col gap-8">
        
        {/* Navbar */}
        <header className="flex justify-between items-center bg-white/5 border border-white/10 backdrop-blur-md px-6 py-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              WanderSync <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI</span>
            </h1>
          </div>
          <button className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full transition-all duration-300 backdrop-blur-sm text-sm font-semibold">
            <Download className="w-4 h-4" /> Export Itinerary
          </button>
        </header>

        <main className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: AI Prompt */}
          <div className="xl:col-span-4 flex flex-col justify-center gap-6">
            <div>
              <h2 className="text-5xl font-black text-white leading-[1.1] mb-4">
                Don't just travel.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Live the vibe.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Tell our AI what you're feeling. Mountains, deep forests, or spiritual peace? We'll craft the perfect escape.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="relative group mt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center bg-[#18181b] border border-white/10 rounded-3xl p-2 shadow-2xl">
                <input
                  type="text"
                  value={vibeInput}
                  onChange={(e) => setVibeInput(e.target.value)}
                  placeholder="E.g., peaceful mountains in North India..."
                  className="w-full bg-transparent text-white px-4 py-3 outline-none placeholder:text-slate-500 text-sm md:text-base"
                />
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="bg-white text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Generate <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Dynamic Data Results */}
          <div className="xl:col-span-8 relative min-h-[600px]">
            {planData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* 1. Dynamic Destination Photo Card */}
                <div className="md:col-span-2 md:row-span-1 bg-[#18181b] border border-white/10 rounded-3xl overflow-hidden relative group min-h-[250px] flex flex-col justify-end">
                  {/* Using AI Image generation based on the destination name */}
                  <img 
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(planData.destination)}%20India%20landscape%20beautiful%20high%20quality?width=1200&height=600&nologo=true`} 
                    alt="Destination" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" 
                  />
                  
                  {/* Location Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full z-10">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white text-md">{planData.destination}</span>
                  </div>

                  {/* Travel Distance & Live Location Strip */}
                  <div className="relative z-10 bg-black/70 backdrop-blur-md border-t border-white/10 p-4 mt-auto">
                    <div className="flex items-center gap-3 text-slate-200 text-sm">
                      <div className="p-2 bg-blue-500/20 rounded-lg"><Navigation className="w-4 h-4 text-blue-400" /></div>
                      <div>
                        <p className="font-semibold text-white">Travel Distance & Route</p>
                        <p className="text-xs text-slate-400 mt-1">{planData.distance}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. REAL AI Budget Card */}
                <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 flex flex-col justify-center hover:bg-white/[0.03] transition-colors md:col-span-1 md:row-span-1">
                  <div className="w-12 h-12 bg-green-500/20 text-green-400 flex items-center justify-center rounded-xl mb-4">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h3 className="text-slate-400 text-sm font-medium mb-2">AI Estimated Budget</h3>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                    {planData.budget}
                  </p>
                  <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                    Personalized according to destination costs and 3-day duration.
                  </p>
                </div>

                {/* 3. Detailed Itinerary Card */}
                <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 flex flex-col md:col-span-3 md:row-span-2 hover:bg-white/[0.03] transition-colors overflow-hidden max-h-[500px]">
                  <div className="flex items-center gap-3 mb-6 sticky top-0 bg-[#18181b] pb-2 z-10">
                    <div className="w-10 h-10 bg-purple-500/20 text-purple-400 flex items-center justify-center rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-white font-bold text-xl">Your Handcrafted GenZ Itinerary</h3>
                  </div>
                  
                  <div className="overflow-y-auto pr-4 custom-scrollbar text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {planData.itinerary}
                  </div>
                </div>

              </div>
            ) : (
              // Empty State
              <div className="w-full h-full border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-10 bg-[#18181b]/50 backdrop-blur-sm">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Awaiting Your Vibe</h3>
                <p className="text-slate-500 max-w-md">
                  Enter your mood. We'll use your live location to calculate distance, budget, and show you the actual photo of the destination!
                </p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}