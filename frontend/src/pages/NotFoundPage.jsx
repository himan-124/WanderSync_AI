import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F2EE] text-[#111]" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
        `}
      </style>
      <div className="bg-white p-12 rounded-3xl border-2 border-black shadow-[8px_8px_0_0_#FF4F4F] text-center max-w-md w-full mx-4">
        <h1 className="text-8xl font-black text-[#111] mb-2">404</h1>
        <div className="bg-[#7C3AED] text-white font-bold text-sm uppercase tracking-wider px-3 py-1 rounded-full border-2 border-black inline-block mb-6 shadow-[2px_2px_0_0_#111]">
          Vibe Check Failed
        </div>
        <p className="text-lg font-medium text-[#666] mb-8">
          This page is literally not giving what it's supposed to give. Let's go back.
        </p>
        <Link 
          to="/" 
          className="bg-[#111] text-white font-bold py-4 px-8 rounded-full border-2 border-black shadow-[4px_4px_0_0_#7C3AED] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#7C3AED] transition-all inline-block w-full"
        >
          Take Me Home 🚀
        </Link>
      </div>
    </div>
  );
}
