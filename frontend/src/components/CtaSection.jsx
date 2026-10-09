import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-[#FBFBFA] to-amber-50/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-slate-900 text-white shadow-soft-lg relative overflow-hidden">
          
          {/* Subtle decorative glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-400/10 text-amber-300 border border-amber-400/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Empowering Potential
            </span>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Every Child Has the Potential to Shine.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
              Discover programs tailored to develop your child's creativity, academic focus, and confidence.
            </p>

            <div className="mt-8 sm:mt-10">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Our Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
