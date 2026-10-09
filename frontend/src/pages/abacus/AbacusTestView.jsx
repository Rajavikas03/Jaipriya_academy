import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { abacusService } from '../../services/abacusService';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Loader2, 
  X, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import WavingFlagBanner from '../../components/WavingFlagBanner';

export default function AbacusTestView() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Submit Confirmation Modal
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Load Attempt Data
  useEffect(() => {
    let isMounted = true;

    async function loadAttempt() {
      try {
        setLoading(true);
        setError(null);
        const data = await abacusService.getAttempt(attemptId);
        
        if (!isMounted) return;

        // If already submitted or expired, navigate directly to results
        if (data.status === 'SUBMITTED' || data.status === 'AUTO_SUBMITTED') {
          navigate(`/dashboard/abacus/results/${data.id}`, { replace: true });
          return;
        }

        setAttempt(data);
        setQuestions(data.questions || []);
        
        // Normalize saved answers map
        const initialAnswers = {};
        if (data.saved_answers) {
          Object.entries(data.saved_answers).forEach(([qId, val]) => {
            if (val) initialAnswers[Number(qId)] = val;
          });
        }
        setAnswers(initialAnswers);
        setRemainingSeconds(data.remaining_seconds);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load test attempt.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAttempt();

    return () => {
      isMounted = false;
    };
  }, [attemptId, navigate]);

  // Handle final submission (Manual or Auto-expiry)
  const handleSubmit = useCallback(async (isAuto = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setConfirmSubmitOpen(false);
      const result = await abacusService.submitTest(attemptId);
      navigate(`/dashboard/abacus/results/${result.id}`, { replace: true });
    } catch (err) {
      console.error('Submission error:', err);
      // If error occurs, try navigating to result in case server already closed attempt
      navigate(`/dashboard/abacus/results/${attemptId}`, { replace: true });
    }
  }, [attemptId, navigate, submitting]);

  // Timer interval countdown
  useEffect(() => {
    if (remainingSeconds === null || submitting) return;

    if (remainingSeconds <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, submitting, handleSubmit]);

  // Handle Option Select & Save
  const handleSelectOption = async (questionId, option) => {
    if (submitting || (remainingSeconds !== null && remainingSeconds <= 0)) return;

    // Optimistic UI update
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));

    try {
      await abacusService.saveAnswer(attemptId, questionId, option);
    } catch (err) {
      console.error(`Failed to save answer for question ${questionId}:`, err);
    }
  };

  // Format MM:SS
  const formatTime = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined) return '--:--';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const totalQuestions = questions.length;
  const isUrgent = remainingSeconds !== null && remainingSeconds < 120; // Under 2 minutes

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FBFBFA] py-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="text-sm font-medium">Loading your test questions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Error Loading Test</h2>
          <p className="text-xs text-rose-700 leading-relaxed mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/abacus')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Return to Abacus Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Waving Flag Starting Banner */}
        <WavingFlagBanner 
          title="Abacus Speed Arithmetic Started!" 
          subtitle="Stay focused, beat the clock, and do your best!"
        />

        {/* Sticky Test Header with Timer & Progress */}
        <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Title & Level */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {attempt?.level_display}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Standard MCQ
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {attempt?.test_title}
              </h1>
            </div>

            {/* Timer & Answered Tracker */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              
              {/* Answered Progress Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Answered: <strong>{answeredCount}</strong> / {totalQuestions}</span>
              </div>

              {/* Timer Pill */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
                  isUrgent
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-600' : 'text-amber-700'}`} />
                <span className="text-sm tracking-wider">{formatTime(remainingSeconds)}</span>
              </div>

              {/* Quick Submit button on desktop header */}
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(true)}
                disabled={submitting}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>

            </div>

          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Vertical Scrolling Questions List */}
        <div className="space-y-6 mb-12">
          {questions.map((q, index) => {
            const questionNumber = index + 1;
            const selectedOpt = answers[q.id];
            const isAnswered = Boolean(selectedOpt);

            const options = [
              { label: 'A', text: q.option_a },
              { label: 'B', text: q.option_b },
              { label: 'C', text: q.option_c },
              { label: 'D', text: q.option_d },
            ];

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className={`bg-white border rounded-3xl p-6 sm:p-7 shadow-card transition-all ${
                  isAnswered 
                    ? 'border-amber-200/90 shadow-soft-sm' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                      {questionNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Question {questionNumber} of {totalQuestions}
                    </span>
                  </div>

                  {isAnswered && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Answered
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6 leading-relaxed">
                  {q.question_text}
                </h2>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((opt) => {
                    const isSelected = selectedOpt === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.label)}
                        disabled={submitting}
                        className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-50/90 border-amber-400 text-slate-900 shadow-xs ring-1 ring-amber-400'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-xs sm:text-sm font-medium leading-tight">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Submission Action Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ready to submit your test?
            </h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              You have answered {answeredCount} of {totalQuestions} questions. You can review any questions before submitting.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfirmSubmitOpen(true)}
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Test</span>
              </>
            )}
          </button>
        </div>

        {/* Confirmation Modal */}
        {confirmSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative">
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                disabled={submitting}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Submit Abacus Test?
              </h3>
              
              <p className="text-xs text-slate-600 font-light mb-4">
                You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.
                {answeredCount < totalQuestions && (
                  <span className="block mt-1 text-amber-800 font-medium">
                    Note: You still have {totalQuestions - answeredCount} unanswered questions.
                  </span>
                )}
              </p>

              <p className="text-[11px] text-slate-400 mb-6 font-light">
                Once submitted, your answers will be automatically evaluated on the server and your results will be displayed.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitOpen(false)}
                  disabled={submitting}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Keep Reviewing
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Yes, Submit</span>
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

