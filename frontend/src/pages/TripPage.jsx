import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TripDetailPage } from '@/features/trip/components/TripDetailPage';
import { useTrip } from '@/features/trip/hooks/useTrip';

export function TripPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { itinerary, loading, error } = useTrip(id);
  const plan = location.state?.plan || itinerary;

  if (loading && !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F2EE] text-[#111]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
          `}
        </style>
        <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[6px_6px_0_0_#7C3AED] flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#F4F2EE] border-t-[#7C3AED] rounded-full animate-spin"></div>
          <div className="text-lg font-bold text-[#111] animate-pulse">Cooking up your trip... ✨</div>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F2EE] p-8 text-[#111]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
          `}
        </style>
        <div className="bg-white border-2 border-black p-10 rounded-3xl shadow-[8px_8px_0_0_#FF4F4F] max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#FF4F4F] text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 border-2 border-black shadow-[4px_4px_0_0_#111]">
            ❌
          </div>
          <div className="text-2xl font-black mb-2">Yikes. Something broke.</div>
          <div className="text-[#666] font-medium mb-8">{error}</div>
          <button 
            className="w-full px-6 py-4 bg-[#111] text-white font-bold rounded-full border-2 border-[#111] shadow-[4px_4px_0_0_#FF4F4F] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#FF4F4F] transition-all" 
            onClick={() => navigate('/planner')}
          >
            Try Again 🔄
          </button>
        </div>
      </div>
    );
  }

  return (
    <main id="main-content">
      <TripDetailPage 
        plan={plan} 
        planId={id} 
      />
    </main>
  );
}
