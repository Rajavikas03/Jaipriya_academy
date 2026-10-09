import React from 'react';
import { whyChooseUsData } from '../data/whyChooseUsData';
import { Compass, Sparkles, Award, HeartHandshake } from 'lucide-react';

const iconMap = {
  Compass: Compass,
  Sparkles: Sparkles,
  Award: Award,
  HeartHandshake: HeartHandshake,
};

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 md:py-28 bg-white border-y border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/60 mb-3">
            Our Core Values
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Why Choose JaiPriya Academy?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-light">
            Guiding principles designed to foster curiosity, character, and lifelong confidence.
          </p>
        </div>

        {/* 4 Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUsData.map((item) => {
            const IconComponent = iconMap[item.iconName] || Sparkles;
            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-[#FBFBFA] border border-slate-200/80 shadow-card hover:border-amber-200 hover:shadow-soft transition-all duration-200 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-800 mb-5">
                  <IconComponent className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

