import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  User, 
  IdCard, 
  Calculator, 
  LogOut,
  ArrowRight,
  Sparkles,
  Trophy,
  BookOpen,
  Phone,
  FileSpreadsheet
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const displayName = user?.full_name || user?.first_name || 'Student';
  const mobile = user?.mobile_number || '—';
  const studentId = user?.student_id || 'JPA-2026-XXXX';
  const standard = user?.standard || 'Enrolled Student';
  const abacusLevel = user?.abacus_level_display || user?.abacus_level || 'Not Assigned';

  return (
    <div className="py-8 sm:py-12 md:py-14 bg-[#FBFBFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-card mb-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-amber-100/40 blur-3xl pointer-events-none -z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-xs">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {standard}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Student Portal
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-light">
                  Ready to practice your mental math skills today? Let's learn and excel together!
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>

          {/* Student Profile Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-xs sm:text-sm">
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Student Name</span>
                <span className="font-bold text-slate-800 truncate block max-w-[130px]">{displayName}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Registered Mobile</span>
                <span className="font-semibold text-slate-800 font-mono">{mobile}</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/70 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-800 shadow-xs">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-amber-700 font-medium block">Current Level</span>
                <span className="font-bold text-amber-950 font-serif text-sm sm:text-base">{abacusLevel}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-700 shadow-xs">
                <IdCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Student ID</span>
                <span className="font-semibold text-slate-800 font-mono">{studentId}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Action Callout: Weekly Tests */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weekly Assessments Ready</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Take Your {abacusLevel} Tests
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light max-w-xl">
              Solve multiple-choice mental arithmetic questions, beat the 10-minute clock, and view your score instantly upon submission.
            </p>
          </div>

          <Link
            to="/tests"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <span>Open Tests Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
