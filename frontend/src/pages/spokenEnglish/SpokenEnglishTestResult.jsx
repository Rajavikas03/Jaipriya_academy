import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { spokenEnglishService } from '../../services/spokenEnglishService';
import AudioPlayer from '../../components/AudioPlayer';
import ConfettiCelebration from '../../components/ConfettiCelebration';
import { 
  Trophy, 
  CheckCircle, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Clock,
  Mic,
  Calendar,
  Volume2,
  Award,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

export default function SpokenEnglishTestResult() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        setError(null);
        const data = await spokenEnglishService.getTestResult(attemptId);
        setResult(data);
      } catch (err) {
        console.error('Failed to load test result:', err);
        setError(err.message || 'Unable to retrieve test results.');
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FBFBFA] py-16 text-slate-500 gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
        <span className="text-sm font-semibold text-slate-700">Loading Assessment Results...</span>
        <span className="text-xs text-slate-400">Retrieving submitted recordings and evaluation details</span>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-rose-900 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Error Loading Results</h2>
          <p className="text-xs sm:text-sm text-rose-700 leading-relaxed mb-6">{error || 'Test result not found.'}</p>
          <Link
            to="/tests/spoken-english"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Spoken English Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  const isScored = result.status === 'SCORED' && result.overall_score !== null;
  const isPartiallyScored = result.status === 'PARTIALLY_SCORED';
  const recordingsList = result.recordings || [];

  return (
    <div className="py-10 sm:py-14 bg-[#FBFBFA] min-h-screen relative">
      {/* Interactive Party Pops Confetti Celebration */}
      <ConfettiCelebration />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/tests/spoken-english"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Spoken English Hub</span>
          </Link>
        </div>

        {/* Results Banner Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-card text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl pointer-events-none -z-0"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 text-blue-800 mx-auto flex items-center justify-center mb-4 shadow-xs">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Spoken English Voice Assessment</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight mb-2">
              Test Submitted Successfully! 🎉
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-light max-w-xl mx-auto mb-6">
              Category: <strong className="text-slate-800 font-semibold">{result.content_type || 'Comprehensive'}</strong> • Submitted by <strong className="text-slate-800 font-semibold">{result.student_name}</strong>
            </p>

            {/* Status Card */}
            {!isScored ? (
              <div className="my-4 p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 max-w-xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2 font-bold text-sm text-amber-900">
                  <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                  <span>
                    {isPartiallyScored ? 'Teacher Review In Progress' : 'Pending Teacher Pronunciation Review'}
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your test is currently being reviewed by your teacher.
                  {result.scored_recordings_count > 0 && (
                    <span className="block mt-1 font-semibold">
                      ({result.scored_recordings_count} of {result.total_items} questions evaluated so far)
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <div className="my-4 py-5 px-8 rounded-2xl bg-emerald-50/80 border border-emerald-200 inline-block">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                  Overall Score (Evaluated by Teacher)
                </span>
                <span className="text-4xl sm:text-5xl font-serif font-bold text-slate-900">
                  {result.overall_score} / 100
                </span>
                {result.feedback && (
                  <p className="text-xs text-emerald-900 font-medium mt-2">
                    {result.feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          
          {/* Total Questions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-card text-center">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider mb-1">
              Total Questions
            </span>
            <span className="text-2xl font-serif font-bold text-slate-900">
              {result.total_items}
            </span>
          </div>

          {/* Recordings Submitted */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-card text-center bg-emerald-50/20">
            <span className="text-[11px] font-medium text-emerald-700 block uppercase tracking-wider mb-1">
              Recordings Submitted
            </span>
            <span className="text-2xl font-serif font-bold text-emerald-700">
              {result.recorded_items}
            </span>
          </div>

          {/* Assessment Type */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-card text-center">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider mb-1">
              Test Category
            </span>
            <span className="text-base font-bold text-blue-900 mt-1 block truncate">
              {result.content_type}
            </span>
          </div>

          {/* Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-card text-center">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider mb-1">
              Evaluation Status
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${
              isScored
                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                : isPartiallyScored
                ? 'text-blue-800 bg-blue-50 border-blue-200'
                : 'text-amber-800 bg-amber-50 border-amber-200'
            }`}>
              {isScored ? 'Graded' : isPartiallyScored ? 'Under Review' : 'Pending Review'}
            </span>
          </div>

        </div>

        {/* Submitted Audio Recordings Review Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Your Submitted Voice Recordings
                </h3>
                <p className="text-xs text-slate-500 font-light">
                  Listen back to each audio response recorded during your assessment.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
              {recordingsList.length} Items
            </span>
          </div>

          {recordingsList.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No audio recordings found for this attempt.
            </div>
          ) : (
            <div className="space-y-4">
              {recordingsList.map((rec, idx) => (
                <div 
                  key={rec.id || idx}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {rec.content_item_title || `Question ${idx + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200 uppercase tracking-wider">
                        {rec.content_item_type}
                      </span>
                      {rec.teacher_score !== null && rec.teacher_score !== undefined ? (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Teacher Score: {rec.teacher_score} / 100
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200">
                          Score: Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 mb-3.5">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">
                      Prompt Text:
                    </span>
                    <p className="text-sm sm:text-base font-serif font-bold text-slate-900">
                      "{rec.content_item_text}"
                    </p>
                  </div>

                  {/* Audio Player for Student's Recording */}
                  {rec.audio_url ? (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1 flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Your Voice Recording:</span>
                      </span>
                      <AudioPlayer src={rec.audio_url} title={`Response for Question ${idx + 1}`} />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No audio recorded for this question.</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/tests/spoken-english/test"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Take Another Test</span>
          </Link>
          <Link
            to="/tests/spoken-english"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Spoken English Hub</span>
          </Link>
          <Link
            to="/tests"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Subjects Hub</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

