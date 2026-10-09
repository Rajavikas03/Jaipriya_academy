import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { abacusService } from '../services/abacusService';
import { 
  Calculator, 
  Clock, 
  HelpCircle, 
  Play, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  X, 
  Sparkles, 
  ArrowRight, 
  Trophy,
  BookOpen,
  Layers
} from 'lucide-react';

export default function Tests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeSubject, setActiveSubject] = useState('abacus'); // 'abacus' | 'spoken-english'
  const [levelInfo, setLevelInfo] = useState({
    abacus_level: null,
    abacus_level_display: null,
    has_assigned_level: false,
    full_name: '',
    standard: '',
  });
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Start test confirmation modal state
  const [selectedTest, setSelectedTest] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadTestData() {
      try {
        setLoading(true);
        setError(null);

        const levelData = await abacusService.getMyLevel();
        setLevelInfo(levelData);

        if (levelData.has_assigned_level) {
          const testsData = await abacusService.getAvailableTests();
          setTests(testsData || []);
        }
      } catch (err) {
        console.error('Error loading tests:', err);
        setError(err.message || 'Failed to load test catalog.');
      } finally {
        setLoading(false);
      }
    }

    loadTestData();
  }, []);

  const handleStartTest = async () => {
    if (!selectedTest) return;
    try {
      setStarting(true);
      const attempt = await abacusService.startTest(selectedTest.id);
      setSelectedTest(null);
      navigate(`/dashboard/abacus/attempt/${attempt.id}`);
    } catch (err) {
      alert(err.message || 'Could not start test. Please try again.');
      setStarting(false);
    }
  };

  const studentName = levelInfo.full_name || user?.full_name || user?.first_name || 'Student';

  return (
    <div className="py-8 sm:py-12 md:py-14 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Welcome Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-amber-100/40 blur-3xl pointer-events-none -z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Student Learning & Assessments Hub
                </span>
                {levelInfo.standard && (
                  <span className="text-xs text-slate-500 font-medium">
                    • {levelInfo.standard}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Welcome, {studentName}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-light">
                Choose a subject below to explore lessons, theory, and practice tests.
              </p>
            </div>

            {levelInfo.has_assigned_level && (
              <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:items-end shrink-0">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-800 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-700" />
                  Your Abacus Level
                </span>
                <span className="text-xl sm:text-2xl font-serif font-bold text-amber-950">
                  {levelInfo.abacus_level_display}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Two Subject Exploration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* 1. Abacus Card */}
          <div 
            onClick={() => setActiveSubject('abacus')}
            className={`cursor-pointer bg-white border-2 rounded-3xl p-6 sm:p-7 shadow-card transition-all flex flex-col justify-between relative overflow-hidden ${
              activeSubject === 'abacus'
                ? 'border-amber-400 ring-2 ring-amber-200/60 shadow-soft-lg'
                : 'border-slate-200 hover:border-amber-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Timed Tests
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Abacus Mental Math
              </h2>
              <p className="text-xs text-slate-600 font-light leading-relaxed mb-6">
                Practice your calculation skills with 10-minute timed assessments customized for your level ({levelInfo.abacus_level_display || 'Assigned Level'}).
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">
                {activeSubject === 'abacus' ? '● Currently Viewing' : 'Click to View Tests'}
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-900">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. Spoken English Card */}
          <div 
            className="bg-white border-2 border-slate-200 hover:border-blue-300 rounded-3xl p-6 sm:p-7 shadow-card transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Theory & Practice
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Spoken English
              </h2>
              <p className="text-xs text-slate-600 font-light leading-relaxed mb-6">
                Learn grammar foundations, read structured theory concepts, and solve untimed practice multiple-choice questions.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/tests/spoken-english"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>Explore Spoken English</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ABACUS ACTIVE TESTS SECTION */}
        {/* ========================================================================= */}
        {activeSubject === 'abacus' && (
          <div>
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <span className="text-sm font-medium">Loading your weekly Abacus tests...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm mb-6">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Case 1: No Assigned Level */}
            {!loading && !levelInfo.has_assigned_level && (
              <div className="bg-amber-50/70 border border-dashed border-amber-300 rounded-3xl p-8 sm:p-10 text-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-200/80 text-amber-900 mx-auto flex items-center justify-center mb-4">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Abacus Level Not Assigned Yet
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-light mb-6">
                  Your Abacus level has not been assigned yet. Please contact JaiPriya Academy administration or your teacher to set your level.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm transition-all"
                >
                  <span>Contact Academy</span>
                </Link>
              </div>
            )}

            {/* Case 2: Level Assigned - Show Tests */}
            {!loading && levelInfo.has_assigned_level && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Abacus Tests
                    </h2>
                    <p className="text-xs text-slate-500 font-light">
                      Select a test below to start your mental arithmetic challenge.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                    {tests.length} {tests.length === 1 ? 'Test' : 'Tests'}
                  </span>
                </div>

                {tests.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
                    <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-800">No active tests scheduled yet.</p>
                    <p className="text-xs text-slate-500 mt-1 font-light">
                      Weekly practice tests will be published by your mentor soon.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(
                      tests.reduce((acc, test) => {
                        const lvl = test.level_display || test.level;
                        if (!acc[lvl]) acc[lvl] = [];
                        acc[lvl].push(test);
                        return acc;
                      }, {})
                    ).map(([levelName, levelTests]) => (
                      <div key={levelName}>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{levelName} Tests</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {levelTests.map((test) => (
                            <div
                              key={test.id}
                              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-card hover:shadow-soft-lg hover:border-amber-300 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                    {test.level_display}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{test.duration_minutes} Mins</span>
                                  </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                  {test.title}
                                </h3>

                                <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                    {test.questions_count} Questions
                                  </span>
                                  <span>•</span>
                                  <span>10-Minute Timer</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedTest(test)}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                              >
                                <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                                <span>Start Test</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Start Test Friendly Confirmation Modal */}
        {selectedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative">
              <button
                type="button"
                onClick={() => setSelectedTest(null)}
                disabled={starting}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                    {selectedTest.level_display}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Ready to Challenge Yourself?
                  </h3>
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 space-y-2 text-xs text-slate-700 mb-5">
                <p className="font-medium text-amber-950">
                  You are about to begin: <strong>{selectedTest.title}</strong>
                </p>
                <div className="flex justify-between py-1 border-t border-amber-200/50 pt-2">
                  <span className="text-slate-500">Total Questions:</span>
                  <span className="font-semibold text-slate-800">{selectedTest.questions_count} Questions</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-semibold text-slate-800">{selectedTest.duration_minutes} Minutes</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mb-6 font-light">
                🌟 <em>"Take your time, stay focused, and do your best!"</em>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTest(null)}
                  disabled={starting}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartTest}
                  disabled={starting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start My Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
