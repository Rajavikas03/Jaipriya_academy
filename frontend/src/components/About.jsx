import React from 'react';
import { Sparkles, BookOpen, Heart, Info } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white border-y border-slate-200/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            About Our Academy
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Nurturing Young Minds to Learn, Grow & Shine
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            JaiPriya Academy is a welcoming space where young learners explore their passions, build enduring confidence, and build foundational life skills.
          </p>
        </div>

        {/* Narrative & Story Placeholder Box */}
        <div className="bg-[#FBFBFA] border border-slate-200/80 rounded-2xl p-6 sm:p-8 md:p-10 mb-12 shadow-card">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-amber-100/60 border border-amber-200/80 items-center justify-center text-amber-800 shrink-0 mt-1">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p className="text-base sm:text-lg font-medium text-slate-900">
                "JaiPriya Academy is a place where young learners explore, learn and grow with confidence."
              </p>
              
              <p className="text-sm sm:text-base text-slate-600">
                Our educational approach is designed to balance structured academic learning with creative expression and personal development. Whether introducing a toddler to their first classroom setting or coaching a student in advanced mental arithmetic and classical arts, our programs are crafted to support each child's individual pace and potential.
              </p>

              {/* Explicit Placeholder Note for Academy Story */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-dashed border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">For us, students are not names on an attendance sheet or numbers in a result book. They are the reason our story exists.</span>
                  What started as a small step in education has grown into a community built around curiosity, confidence, discipline, and care. Through the years, our classrooms have changed, our methods have evolved, and our achievements have grown but one thing has never changed: our commitment to our students
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Metrics & Placeholders (No Invented Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 text-center transition-all hover:border-slate-300">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
              [10+ Years]
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
              Experience
            </div>
            <p className="text-xs text-slate-400 mt-2">
              (Placeholder for official years of excellence)
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 text-center transition-all hover:border-slate-300">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
              [100+ Students]
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
              Students Guided
            </div>
            <p className="text-xs text-slate-400 mt-2">
              (Placeholder for student community count)
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 text-center transition-all hover:border-slate-300">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
              [Excellent Mentors]
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
              Dedicated Educators
            </div>
            <p className="text-xs text-slate-400 mt-2">
              (Placeholder for faculty & instructors)
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

