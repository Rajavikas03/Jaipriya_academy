import React from 'react';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  const handleScrollToNext = (e) => {
    e.preventDefault();
    const target = document.querySelector('#about');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home" 
      className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-12 select-none"
    >
      {/* Subtle background ambient glow (minimal & non-distracting) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-[320px] sm:w-[500px] md:w-[650px] h-[320px] sm:h-[500px] md:h-[650px] rounded-full bg-amber-100/40 blur-3xl opacity-70"></div>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Main visual center: JaiPriya Academy */}
        <h1 className="flex flex-col items-center tracking-tight text-slate-900 font-serif">
          <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight text-slate-900 drop-shadow-xs">
            JaiPriya
          </span>
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-widest uppercase text-amber-800/90 mt-2 sm:mt-3 font-sans">
            Academy
          </span>
        </h1>

        {/* Tagline */}
        <p className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl font-light text-slate-600 tracking-wide">
          Learn. Grow. Shine.
        </p>

        {/* Single Primary Action Button */}
        <div className="mt-10 sm:mt-12">
          <a
            href="#about"
            onClick={handleScrollToNext}
            className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            <span>Explore Our Academy</span>
            <ArrowDown className="w-4 h-4 text-amber-300 animate-bounce" />
          </a>
        </div>
      </div>

      {/* Subtle indicator at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 text-xs font-medium tracking-wider uppercase opacity-60 hidden sm:block">
        Scroll to discover
      </div>
    </section>
  );
}

