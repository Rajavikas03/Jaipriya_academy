import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { spokenEnglishService } from '../../services/spokenEnglishService';
import AudioPlayer from '../../components/AudioPlayer';
import AudioRecorder from '../../components/AudioRecorder';
import WavingFlagBanner from '../../components/WavingFlagBanner';
import { 
  Mic, 
  Headphones, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Award
} from 'lucide-react';

export default function SpokenEnglishPractice() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');

  const [moduleInfo, setModuleInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccessMap, setSaveSuccessMap] = useState({});

  useEffect(() => {
    async function fetchPractice() {
      if (!moduleId) {
        setError('No batch ID provided.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await spokenEnglishService.getModuleDetail(moduleId);
        setModuleInfo(data.module || data);
        setItems(data.items || []);
      } catch (err) {
        console.error('Error loading practice items:', err);
        setError(err.message || 'Failed to load practice content.');
      } finally {
        setLoading(false);
      }
    }

    fetchPractice();
  }, [moduleId]);

  const handleSaveRecording = async (itemId, audioBlob) => {
    try {
      const response = await spokenEnglishService.submitPracticeRecording(itemId, audioBlob);
      setSaveSuccessMap((prev) => ({
        ...prev,
        [itemId]: response.recording || true,
      }));
      // Update item local state
      setItems((prevItems) =>
        prevItems.map((it) =>
          it.id === itemId
            ? { ...it, latest_practice_recording: response.recording }
            : it
        )
      );
    } catch (err) {
      console.error('Failed to save practice voice recording:', err);
      throw err;
    }
  };

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

          {moduleId && (
            <Link
              to={`/tests/spoken-english/test?moduleId=${moduleId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <span>Go to Test Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Waving Flag Banner */}
        <div className="mb-6">
          <WavingFlagBanner text="Practice Mode: Listen closely, record your voice, and speak with confidence! 🚩" />
        </div>

        {/* Header Card */}
        <div className="bg-white border border-emerald-200/90 rounded-3xl p-6 sm:p-8 shadow-card mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 shadow-xs">
                <Mic className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Step 2: Practice
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Read + Listen + Record Mode
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  {moduleInfo ? moduleInfo.title : 'Interactive Speech & Voice Practice'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-light">
                  {moduleInfo?.description || '1. Listen to the teacher audio • 2. Tap Record & speak clearly • 3. Review your playback & save.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mb-8">
          <span className="text-xs font-mono text-slate-500">
            {items.length} {items.length === 1 ? 'practice exercise' : 'practice exercises'}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Loading practice items...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Practice Items List */}
        {!loading && !error && (
          <div className="space-y-8 mb-12">
            {items.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-800">No Practice content has been added yet.</p>
                <p className="text-xs text-slate-500 mt-1 font-light">
                  Practice exercises published by the academy will appear here.
                </p>
              </div>
            ) : (
              items.map((item, idx) => {
                const latestRec = item.latest_practice_recording || saveSuccessMap[item.id];

                return (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card hover:border-emerald-300 transition-all space-y-6"
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                          {item.content_type} #{item.order || idx + 1}
                        </span>
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                          {item.title}
                        </h3>
                      </div>

                      {latestRec && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Practice Recorded</span>
                        </span>
                      )}
                    </div>

                    {/* Text Prompt */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Text to speak aloud:
                      </p>
                      <p className="text-base sm:text-lg text-slate-900 font-medium whitespace-pre-line leading-relaxed">
                        {item.text_content}
                      </p>
                    </div>

                    {/* Split View: 1. Reference Audio & 2. Student Voice Recorder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Left: Reference Audio */}
                      <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                            <Headphones className="w-4 h-4 text-amber-600" />
                            <span>1. Listen to Teacher Pronunciation</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Play once or twice to notice stress, vowels, and pauses.
                          </p>
                        </div>

                        <AudioPlayer
                          src={item.reference_audio_url}
                          title={`Teacher: ${item.title}`}
                        />
                      </div>

                      {/* Right: Student Voice Recorder */}
                      <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                            <Mic className="w-4 h-4 text-emerald-600" />
                            <span>2. Record & Save Your Voice</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Tap record, speak aloud, then review before saving.
                          </p>
                        </div>

                        <AudioRecorder
                          buttonLabel="Save Practice"
                          onSave={(blob) => handleSaveRecording(item.id, blob)}
                        />
                      </div>
                    </div>

                    {/* Previous saved practice recording playback if available */}
                    {latestRec && latestRec.audio_url && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Latest Saved Practice Recording:</span>
                        </div>
                        <div className="w-full sm:w-64 shrink-0">
                          <AudioPlayer
                            src={latestRec.audio_url}
                            title="Your Recording"
                          />
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Bottom Next Step Callout */}
        {!loading && items.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-700 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Ready for the real test?</span>
              </span>
              <h3 className="text-xl font-bold font-serif">Advance to Step 3: Independent Test</h3>
              <p className="text-xs sm:text-sm text-indigo-200 font-light max-w-md">
                Test your independent reading and pronunciation without reference audio.
              </p>
            </div>

            <Link
              to={moduleId ? `/tests/spoken-english/test?moduleId=${moduleId}` : `/tests/spoken-english/test`}
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all shrink-0 flex items-center gap-2"
            >
              <span>Take Spoken Test</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
