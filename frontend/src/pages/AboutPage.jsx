import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Palette, 
  Award, 
  TrendingUp, 
  Heart, 
  Compass, 
  Users, 
  Info,
  Target,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  const approaches = [
    {
      title: 'Active Learning',
      description: 'Engaging, interactive methods that spark genuine curiosity rather than rote memorization.',
      icon: BookOpen,
      accent: 'amber',
    },
    {
      title: 'Creativity & Artistry',
      description: 'Nurturing self-expression through visual arts, performance, and imaginative problem-solving.',
      icon: Palette,
      accent: 'rose',
    },
    {
      title: 'Confidence Building',
      description: 'A supportive atmosphere where children are encouraged to speak, present, and take healthy risks.',
      icon: Award,
      accent: 'blue',
    },
    {
      title: 'Continuous Growth',
      description: 'Step-by-step progression tailored to each child\'s individual developmental pace.',
      icon: TrendingUp,
      accent: 'emerald',
    },
  ];

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-[#FBFBFA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/70 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Discover Our Philosophy
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight">
            ABOUT JAI PRIYA ACADEMY
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-600 font-light leading-relaxed">
            A place where children can learn, explore and grow.
          </p>
        </div>

        {/* 2. Academy Story & Background */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-card mb-16">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-amber-100/70 text-amber-800 border border-amber-200/60">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                Our Academy Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                A dedicated community committed to holistic young minds development.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 leading-relaxed font-light text-sm sm:text-base">
            <p>
              JaiPriya Academy was established with a singular vision: to create a balanced, welcoming, and enriching educational ecosystem where every child feels inspired to discover their talents.
            </p>
            <p>
              We believe that early childhood foundations and extracurricular skill mastery go hand-in-hand. By providing guided programs across mental mathematics, language arts, creative dancing, sports, and early literacy, we support children through every developmental milestone.
            </p>

            {/* Explicit Placeholder Notice for Detailed Academy Story */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-dashed border-amber-300 text-amber-950 mt-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <span className="font-bold block">[Academy Story Placeholder]</span>
                <p className="text-amber-900/90 font-light">
                  Insert real academy founding journey, founder's background, and campus milestones here when provided.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Our Approach: Learning, Creativity, Confidence, Growth */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Pedagogical Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
              Our Core Approach
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-light">
              Structured frameworks that balance discipline with joyous discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {approaches.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-card hover:shadow-soft transition-all duration-200 flex items-start gap-4"
                >
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. What We Believe */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-soft-lg mb-16 relative overflow-hidden">
          <div className="absolute -left-16 -bottom-16 w-52 h-52 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-2">
              <Heart className="w-6 h-6" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              What We Believe
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              Every child is inherently gifted with curiosity. Children learn in diverse ways—some through visual arts, others through rhythm, logic, or guided stories. Our responsibility as mentors is to create an uplifting environment where their individual strengths are celebrated and encouraged to blossom.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-amber-300 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Personalized Attention
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Positive Encouragement
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Respectful Community
              </span>
            </div>
          </div>
        </div>

        {/* 5. Placeholder for Real Academy Information */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Future Content Modules
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">
              Academy Information Structure
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-light">
              Clear sections reserved for official administration information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Vision & Mission Placeholder */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold mb-3">
                <Target className="w-5 h-5 text-amber-700" />
                <span>[Vision & Mission Placeholder]</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Formal mission statement regarding child-centric learning goals and long-term academic excellence will be documented here.
              </p>
            </div>

            {/* Faculty & Mentors Placeholder */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold mb-3">
                <Users className="w-5 h-5 text-amber-700" />
                <span>[Faculty & Team Placeholder]</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Certified instructors, mentor profiles, credentials, and educator biographies will be displayed in this section.
              </p>
            </div>

            {/* Achievements & Milestones Placeholder */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold mb-3">
                <Award className="w-5 h-5 text-amber-700" />
                <span>[Achievements & Milestones Placeholder]</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Student competition milestones, exhibition highlights, and community recognitions will be highlighted here.
              </p>
            </div>

            {/* Campus & Infrastructure Placeholder */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold mb-3">
                <Eye className="w-5 h-5 text-amber-700" />
                <span>[Campus & Facilities Placeholder]</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                Details regarding safety measures, kid-safe classrooms, play zones, and learning tools will be documented here.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

