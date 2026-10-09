import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { spokenEnglishService } from '../../services/spokenEnglishService';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Play
} from 'lucide-react';

export default function SpokenEnglishTopicView() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTopic() {
      try {
        setLoading(true);
        setError(null);
        const data = await spokenEnglishService.getTopic(topicId);
        setTopic(data);
      } catch (err) {
        console.error('Error loading topic details:', err);
        setError(err.message || 'Failed to load topic overview.');
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [topicId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FBFBFA] py-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading topic overview...</span>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Error Loading Topic</h2>
          <p className="text-xs text-rose-700 leading-relaxed mb-4">{error || 'Topic not found.'}</p>
          <Link
            to="/tests/spoken-english"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Topics</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 md:py-14 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/tests/spoken-english"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Topics</span>
          </Link>
        </div>

        {/* Header Overview Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-blue-100/40 blur-3xl pointer-events-none -z-0"></div>

          <div className="relative z-10">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Topic {topic.order || 1} Overview
            </span>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2 mb-2 tracking-tight">
              {topic.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed max-w-2xl">
              {topic.description || "Learn grammar concepts through structured reading, and then test your knowledge with interactive practice questions."}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Layers className="w-4 h-4 text-blue-600" />
                {topic.theory_count} Theory Sections
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                {topic.questions_count} Practice Questions
              </span>
            </div>
          </div>
        </div>

        {/* 2-Step Structured Learning Journey */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">
            Your 2-Step Learning Journey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* STEP 1: Learn the Theory */}
            <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-7 shadow-card flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-blue-50 blur-lg pointer-events-none"></div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                    Step 1
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Learn the Theory
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Read definitions, rules, and example explanations.
                </p>

                <p className="text-xs text-slate-600 font-light leading-relaxed mb-6">
                  Go through the {topic.theory_count} structured theory sections before taking up practice to strengthen your grammatical understanding.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to={`/tests/spoken-english/${topic.id}/theory`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Theory</span>
                </Link>
              </div>
            </div>

            {/* STEP 2: Practice What You Learned */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Step 2
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                    <Play className="w-4 h-4 fill-current text-amber-600" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Practice What You Learned
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Untimed Multiple-Choice Questions
                </p>

                <p className="text-xs text-slate-600 font-light leading-relaxed mb-6">
                  Apply your concepts on {topic.questions_count} curated multiple-choice questions. Submit when ready to receive instant marks and score evaluations.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to={`/tests/spoken-english/${topic.id}/practice`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>Start Practice</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

