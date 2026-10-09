import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { spokenEnglishService } from '../../services/spokenEnglishService';
import { 
  Headphones, 
  Mic, 
  Award, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Volume2,
  FileText,
  Flame,
  Layers
} from 'lucide-react';

export default function SpokenEnglishHome() {
  const [modules, setModules] = useState({ theory: [], practice: [], test: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [theoryData, practiceData, testData] = await Promise.allSettled([
          spokenEnglishService.getModules('THEORY'),
          spokenEnglishService.getModules('PRACTICE'),
          spokenEnglishService.getModules('TEST'),
        ]);

        setModules({
          theory: theoryData.status === 'fulfilled' ? theoryData.value || [] : [],
          practice: practiceData.status === 'fulfilled' ? practiceData.value || [] : [],
          test: testData.status === 'fulfilled' ? testData.value || [] : [],
        });
      } catch (err) {
        console.error('Error loading Spoken English batches:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const renderModuleCard = (mod, type) => {
    const config = {
      THEORY: {
        bgColor: 'bg-white',
        borderColor: 'border-amber-200/80',
        hoverBorderColor: 'hover:border-amber-400',
        iconBgColor: 'bg-amber-100/80 border-amber-200 text-amber-800',
        textColor: 'text-amber-900',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        btnClass: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
        link: `/tests/spoken-english/theory?moduleId=${mod.id}`,
        btnText: 'Open',
        icon: <Headphones className="w-6 h-6" />
      },
      PRACTICE: {
        bgColor: 'bg-white',
        borderColor: 'border-emerald-200/80',
        hoverBorderColor: 'hover:border-emerald-400',
        iconBgColor: 'bg-emerald-100/80 border-emerald-200 text-emerald-800',
        textColor: 'text-emerald-900',
        badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
        link: `/tests/spoken-english/practice?moduleId=${mod.id}`,
        btnText: 'Open',
        icon: <Mic className="w-6 h-6" />
      },
      TEST: {
        bgColor: 'bg-white',
        borderColor: 'border-indigo-200/80',
        hoverBorderColor: 'hover:border-indigo-400',
        iconBgColor: 'bg-indigo-100/80 border-indigo-200 text-indigo-800',
        textColor: 'text-indigo-900',
        badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        btnClass: 'bg-gradient-to-r from-indigo-600 to-slate-900 hover:from-indigo-700 hover:to-slate-800 text-white shadow-indigo-600/20',
        link: `/tests/spoken-english/test?moduleId=${mod.id}`,
        btnText: 'Start Test',
        icon: <Award className="w-6 h-6" />
      }
    }[type];

    return (
      <div key={mod.id} className={`${config.bgColor} border-2 ${config.borderColor} ${config.hoverBorderColor} rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}>
        <div className="relative z-10 flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl ${config.iconBgColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
              {config.icon}
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${config.badgeBg}`}>
              Batch {mod.order}
            </span>
          </div>

          <h3 className={`text-lg font-bold text-slate-900 mb-1.5 group-hover:${config.textColor} transition-colors line-clamp-1`} title={mod.title}>
            {mod.title}
          </h3>
          <p className="text-xs text-slate-600 font-light mb-4 line-clamp-2 h-8">
            {mod.description || 'No description available'}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 w-fit px-2.5 py-1 rounded-lg mb-6 border border-slate-100">
            <Layers className="w-3.5 h-3.5" />
            <span>{mod.items_count || 0} Contents</span>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-slate-100 mt-auto">
          <Link
            to={config.link}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-98 transition-all ${config.btnClass}`}
          >
            <span>{config.btnText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-12 md:py-14 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/tests"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Subjects</span>
          </Link>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-xl mb-10 relative overflow-hidden text-white">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute right-20 -top-10 w-60 h-60 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Batch-Based Learning</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                Spoken English & Pronunciation Academy
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                Build native-level speech confidence through our structured <strong className="text-amber-300 font-medium">Theory</strong> (listen), <strong className="text-emerald-300 font-medium">Practice</strong> (record & review), and independent <strong className="text-purple-300 font-medium">Test</strong> batches.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400 mb-4" />
            <span className="font-medium">Loading Spoken English batches...</span>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 1. THEORY BATCHES */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Theory (Read + Listen)</h2>
                  <p className="text-sm text-slate-500">Listen to clear human pronunciations</p>
                </div>
              </div>
              
              {modules.theory.length === 0 ? (
                <div className="p-8 border border-slate-200 border-dashed rounded-2xl bg-white text-center text-slate-500 text-sm">
                  No theory batches available.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modules.theory.sort((a, b) => a.order - b.order).map(mod => renderModuleCard(mod, 'THEORY'))}
                </div>
              )}
            </div>

            {/* 2. PRACTICE BATCHES */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Practice (Read + Listen + Record)</h2>
                  <p className="text-sm text-slate-500">Listen, record your voice, and compare</p>
                </div>
              </div>
              
              {modules.practice.length === 0 ? (
                <div className="p-8 border border-slate-200 border-dashed rounded-2xl bg-white text-center text-slate-500 text-sm">
                  No practice batches available.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modules.practice.sort((a, b) => a.order - b.order).map(mod => renderModuleCard(mod, 'PRACTICE'))}
                </div>
              )}
            </div>

            {/* 3. TEST BATCHES */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Test (Read + Record + Evaluate)</h2>
                  <p className="text-sm text-slate-500">Independent test with teacher evaluation</p>
                </div>
              </div>
              
              {modules.test.length === 0 ? (
                <div className="p-8 border border-slate-200 border-dashed rounded-2xl bg-white text-center text-slate-500 text-sm">
                  No test batches available.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modules.test.sort((a, b) => a.order - b.order).map(mod => renderModuleCard(mod, 'TEST'))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
