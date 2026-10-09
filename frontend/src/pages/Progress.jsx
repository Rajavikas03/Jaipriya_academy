import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { 
  Trophy, 
  Calculator, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export default function Progress() {
  const [data, setData] = useState({ abacus_tests: [], spoken_english_tests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const response = await apiClient('/student/progress/', { method: 'GET' });
        setData(response || { abacus_tests: [], spoken_english_tests: [] });
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to load progress. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="text-sm font-medium">Loading your progress...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              My Progress
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-light">
            Track your performance in Abacus and Spoken English tests.
          </p>
        </div>

        <div className="space-y-8">
          {/* Abacus Tests Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-900">Abacus Tests</h2>
            </div>
            
            {data.abacus_tests && data.abacus_tests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.abacus_tests.map((test, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {test.level_display || test.level}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{new Date(test.submitted_at || test.started_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{test.test_title}</h3>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm text-slate-600">Score</span>
                      <span className="text-lg font-bold text-amber-700">{test.score_display || `${test.correct_answers} / ${test.total_questions}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800">No Abacus tests taken yet.</p>
              </div>
            )}
          </section>

          {/* Spoken English Tests Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Spoken English Tests</h2>
            </div>
            
            {data.spoken_english_tests && data.spoken_english_tests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.spoken_english_tests.map((test, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${test.status === 'SCORED' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {test.status_display || test.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{new Date(test.submitted_at || test.started_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{test.module_title}</h3>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm text-slate-600">Score</span>
                      {test.status === 'SCORED' ? (
                        <span className="text-lg font-bold text-blue-700">{test.overall_score !== null ? `${test.overall_score.toFixed(1)} / 100` : '-'}</span>
                      ) : (
                        <span className="text-sm font-medium text-amber-600">Evaluation Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800">No Spoken English tests taken yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
