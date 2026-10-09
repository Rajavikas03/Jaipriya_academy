import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { spokenEnglishService } from '../../services/spokenEnglishService';
import ConfettiCelebration from '../../components/ConfettiCelebration';
import { 
  Trophy, 
  CheckCircle, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function SpokenEnglishResults() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        setError(null);
        const data = await spokenEnglishService.getResult(attemptId);
        setResult(data);
      } catch (err) {
        setError(err.message || 'Failed to load practice results.');
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FBFBFA] py-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Evaluating your practice results...</span>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Error Loading Results</h2>
          <p className="text-xs text-rose-700 leading-relaxed mb-4">{error || 'Result record not found.'}</p>
          <Link
            to="/tests/spoken-english"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Spoken English</span>
          </Link>
        </div>
      </div>
    );
  }

  const scorePercent = result.total_questions > 0 ? (result.correct_answers / result.total_questions) * 100 : 0;
  
  let feedbackMessage = "Great job! Keep practicing to strengthen your grammar concepts!";
  if (scorePercent >= 80) {
    feedbackMessage = "Outstanding performance! You have mastered this topic!";
  } else if (scorePercent >= 50) {
    feedbackMessage = "Good effort! Review the theory sections to boost your score even higher!";
  }

  return (
    <div className="py-10 sm:py-14 bg-[#FBFBFA] min-h-screen relative">
      {/* Interactive Party Pops Confetti Celebration */}
      <ConfettiCelebration />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/tests/spoken-english"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Spoken English Topics</span>
          </Link>
        </div>

        {/* Results Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-blue-100/50 blur-3xl pointer-events-none -z-0"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 text-blue-800 mx-auto flex items-center justify-center mb-3 shadow-xs">
              <Trophy className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Spoken English Assessment
            </span>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2 mb-1">
              Practice Completed! 🎉
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-light">
              {result.topic_title}
            </p>

            {/* Score Display */}
            <div className="my-6 py-4 px-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 inline-block">
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block mb-1">
                Your Score
              </span>
              <span className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                {result.correct_answers} <span className="text-slate-400 font-sans font-light text-2xl">/ {result.total_questions}</span>
              </span>
              <p className="text-xs text-blue-900 font-medium mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{feedbackMessage}</span>
              </p>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Successfully Submitted & Evaluated</span>
              </div>
            </div>
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
              {result.total_questions}
            </span>
          </div>

          {/* Attended */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-card text-center">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider mb-1">
              Attended
            </span>
            <span className="text-2xl font-serif font-bold text-blue-900">
              {result.attended_questions}
            </span>
          </div>

          {/* Correct */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-card text-center bg-emerald-50/20">
            <span className="text-[11px] font-medium text-emerald-700 block uppercase tracking-wider mb-1">
              Correct
            </span>
            <span className="text-2xl font-serif font-bold text-emerald-700">
              {result.correct_answers}
            </span>
          </div>

          {/* Skipped */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-card text-center">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider mb-1">
              Skipped
            </span>
            <span className="text-2xl font-serif font-bold text-slate-600">
              {result.skipped_questions}
            </span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/tests/spoken-english"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore More English Topics</span>
          </Link>
          <Link
            to="/tests"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Subjects Hub</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

