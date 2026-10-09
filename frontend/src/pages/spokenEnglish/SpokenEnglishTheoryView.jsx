import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { spokenEnglishService } from '../../services/spokenEnglishService';
import AudioPlayer from '../../components/AudioPlayer';
import { 
  Headphones, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Volume2,
  CheckCircle2
} from 'lucide-react';

export default function SpokenEnglishTheoryView() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');

  const [moduleDetail, setModuleDetail] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTheory() {
      if (!moduleId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await spokenEnglishService.getModuleDetail(moduleId);
        setModuleDetail(data);
        setItems(data.items || []);
      } catch (err) {
        console.error('Error loading theory items:', err);
        setError(err.message || 'Failed to load theory content.');
      } finally {
        setLoading(false);
      }
    }

    fetchTheory();
  }, [moduleId]);

  if (!moduleId) {
    return (
      <div className="py-16 text-center text-slate-500 bg-[#FBFBFA] min-h-screen">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Batch Selected</h2>
        <p className="mb-6">Please select a batch from the Spoken English hub to view theory content.</p>
        <Link to="/tests/spoken-english" className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold shadow hover:bg-amber-600 transition-colors">
          Go to Spoken English Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/tests/spoken-english"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Spoken English Hub</span>
          </Link>

          <Link
            to={`/tests/spoken-english/practice?moduleId=${moduleId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <span>Go to Practice Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-card mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-xs">
                <Headphones className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Batch: {moduleDetail?.title || 'Loading...'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Read + Listen Mode
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Pronunciation & Theory Reader
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-light">
                  {moduleDetail?.description || 'Listen to correct pronunciation audio, read the definitions, and observe how words and sentences flow naturally.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 text-right text-xs font-mono text-slate-500">
          {items.length} {items.length === 1 ? 'lesson item' : 'lesson items'}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-sm font-medium">Loading theory items...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Items List */}
        {!loading && !error && (
          <div className="space-y-6 mb-12">
            {items.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-800">No Theory content has been added to this batch yet.</p>
              </div>
            ) : (
              items.sort((a, b) => a.order - b.order).map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card hover:border-amber-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    
                    {/* Left: Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                          {item.content_type} #{item.order || idx + 1}
                        </span>
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 truncate">
                          {item.title}
                        </h3>
                      </div>

                      {/* Content Text */}
                      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 my-4">
                        <p className="text-sm sm:text-base text-slate-800 font-normal whitespace-pre-line leading-relaxed">
                          {item.text_content}
                        </p>
                      </div>

                      {/* Optional Illustration */}
                      {item.image_url && (
                        <div className="my-3 max-w-xs rounded-2xl overflow-hidden border border-slate-200">
                          <img src={item.image_url} alt={item.title} className="w-full h-auto object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Right: Audio Player Widget */}
                    <div className="w-full md:w-80 shrink-0">
                      <AudioPlayer
                        src={item.reference_audio_url}
                        title={`Listen: ${item.title}`}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom Next Step Callout */}
        {!loading && items.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to speak?</span>
              </span>
              <h3 className="text-xl font-bold font-serif">Move to Step 2: Practice Mode</h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-light max-w-md">
                Put what you heard into action. Listen to the reference audio and record your own voice.
              </p>
            </div>

            <Link
              to={`/tests/spoken-english/practice?moduleId=${moduleId}`}
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition-all shrink-0 flex items-center gap-2"
            >
              <span>Start Practice Recording</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
