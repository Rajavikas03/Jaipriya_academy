import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { abacusService } from '../../services/abacusService';
import { 
  Calculator, 
  Clock, 
  HelpCircle, 
  Play, 
  AlertCircle, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  X
} from 'lucide-react';

export default function AbacusDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [levelInfo, setLevelInfo] = useState({
    abacus_level: null,
    abacus_level_display: null,
    has_assigned_level: false,
  });
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Start test confirmation modal state
  const [selectedTest, setSelectedTest] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadAbacusData() {
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
        console.error('Error loading Abacus dashboard:', err);
        setError(err.message || 'Failed to load Abacus data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadAbacusData();
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

  return (
    <div className="py-10 sm:py-14 md:py-16 bg-[#FBFBFA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Student Dashboard</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-amber-100/50 blur-3xl pointer-events-none -z-0"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-xs">
                <Calculator className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Abacus Learning Hub
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Batch 4 MCQ Portal
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Abacus Tests
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-light">
                  Timed multiple-choice mental arithmetic drills with automatic evaluation.
                </p>
              </div>
            </div>

            {/* Student Level Badge */}
            {levelInfo.has_assigned_level ? (
              <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex flex-col sm:items-end">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-800">
                  Assigned Level
                </span>
                <span className="text-xl sm:text-2xl font-serif font-bold text-amber-950">
                  {levelInfo.abacus_level_display}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="text-sm font-medium">Loading your Abacus tests...</span>
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
              Your Abacus level has not been assigned yet. Please contact JaiPriya Academy administration or your mentor to activate your level.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm transition-all"
            >
              <span>Contact Academy Support</span>
            </Link>
          </div>
        )}

        {/* Case 2: Level Assigned - Show Tests */}
        {!loading && levelInfo.has_assigned_level && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Available Tests for {levelInfo.abacus_level_display}
                </h2>
                <p className="text-xs text-slate-500 font-light">
                  Select a test below to start your timed mental math assessment.
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {tests.length} {tests.length === 1 ? 'Test' : 'Tests'} Available
              </span>
            </div>

            {tests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800">No active tests currently scheduled.</p>
                <p className="text-xs text-slate-500 mt-1 font-light">
                  New practice tests for {levelInfo.abacus_level_display} will appear here soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card hover:shadow-soft-lg hover:border-amber-300 transition-all flex flex-col justify-between"
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

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          {test.questions_count} Questions
                        </span>
                        <span>•</span>
                        <span>Standard MCQ (A, B, C, D)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTest(test)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Test</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Start Test Confirmation Modal */}
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
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                    {selectedTest.level_display}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedTest.title}
                  </h3>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs text-slate-600 mb-6">
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-semibold text-slate-800">{selectedTest.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Questions:</span>
                  <span className="font-semibold text-slate-800">{selectedTest.questions_count} Questions</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Time Policy:</span>
                  <span className="font-semibold text-amber-900">Auto-submits when timer ends</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-light mb-6">
                Once started, the countdown timer will begin immediately. You can scroll through and answer all questions at your own pace.
              </p>

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
                      <span>Start Now</span>
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

