import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { spokenEnglishService } from '../../services/spokenEnglishService';
import AudioRecorder from '../../components/AudioRecorder';
import WavingFlagBanner from '../../components/WavingFlagBanner';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Mic, 
  Send, 
  Sparkles,
  HelpCircle,
  Clock,
  VolumeX,
  FileCheck
} from 'lucide-react';

export default function SpokenEnglishTestView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [testItems, setTestItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Map of contentItemId -> { blob, url, isUploaded, isUploading, error }
  const [recordingsState, setRecordingsState] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  useEffect(() => {
    async function initTest() {
      if (!moduleId) {
        setError('No test batch ID provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch test questions (excluding reference audio)
        const items = await spokenEnglishService.getTestItems(moduleId);
        if (!items || items.length === 0) {
          setTestItems([]);
          setLoading(false);
          return;
        }
        setTestItems(items);

        // 2. Start a new test attempt on backend
        const attemptRes = await spokenEnglishService.startTestAttempt(moduleId);
        setAttemptId(attemptRes.attempt_id);
      } catch (err) {
        console.error('Failed to initialize test:', err);
        setError(err.message || 'Unable to start test assessment.');
      } finally {
        setLoading(false);
      }
    }

    initTest();
  }, [moduleId]);

  const currentItem = testItems[currentIndex] || null;
  const recordedCount = testItems.filter(item => recordingsState[item.id]?.isUploaded).length;
  const isLastQuestion = testItems.length > 0 && currentIndex === testItems.length - 1;

  // Handle when audio is recorded in AudioRecorder
  const handleRecordingComplete = async (itemId, blob, previewUrl) => {
    if (!attemptId) return;

    // Optimistically mark as recording captured
    setRecordingsState(prev => ({
      ...prev,
      [itemId]: {
        blob,
        url: previewUrl,
        isUploading: true,
        isUploaded: false,
        error: null,
      }
    }));

    try {
      // Upload recording to backend
      await spokenEnglishService.uploadTestRecording(attemptId, itemId, blob);
      setRecordingsState(prev => ({
        ...prev,
        [itemId]: {
          blob,
          url: previewUrl,
          isUploading: false,
          isUploaded: true,
          error: null,
        }
      }));
    } catch (err) {
      console.error('Failed to upload test recording:', err);
      setRecordingsState(prev => ({
        ...prev,
        [itemId]: {
          blob,
          url: previewUrl,
          isUploading: false,
          isUploaded: false,
          error: err.message || 'Upload failed. Please try again.',
        }
      }));
    }
  };

  const handleRecordingReset = (itemId) => {
    setRecordingsState(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  // Submit test attempt
  const handleConfirmSubmit = async () => {
    if (!attemptId || submitting) return;

    try {
      setSubmitting(true);
      setShowSubmitModal(false);
      await spokenEnglishService.submitTestAttempt(attemptId);
      // Navigate to results page
      navigate(`/tests/spoken-english/test/results/${attemptId}`);
    } catch (err) {
      alert(err.message || 'Failed to submit test attempt. Please check your internet connection.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FBFBFA] py-16 text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-sm font-semibold text-slate-700">Preparing your Spoken English Test...</span>
        <span className="text-xs text-slate-400">Loading questions & initializing audio test attempt</span>
      </div>
    );
  }

  if (testItems.length === 0) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-slate-900 shadow-card">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">No Test Content Available</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
            No test questions have been published by the academy yet. Please check back later or try Practice mode.
          </p>
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

  if (error || !currentItem) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-rose-900 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Test Assessment Unavailable</h2>
          <p className="text-xs sm:text-sm text-rose-700 leading-relaxed mb-6">{error || 'No test items available.'}</p>
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

  return (
    <div className="py-8 sm:py-12 bg-[#FBFBFA] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => setExitConfirmOpen(true)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Test</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Test Batch
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Recorded: <strong className="text-emerald-700">{recordedCount}</strong> / {testItems.length}
            </span>
          </div>
        </div>

        {/* Waving Flag Banner on Start */}
        <div className="mb-6">
          <WavingFlagBanner 
            title="Spoken English Voice Assessment"
            message="Speak each prompt loudly, clearly, and naturally into your microphone. Reference audio is disabled in test mode."
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>Question {currentIndex + 1} of {testItems.length}</span>
            <span>{Math.round(((currentIndex + 1) / testItems.length) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / testItems.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Active Question Assessment Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-card mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center font-mono">
                {currentIndex + 1}
              </span>
              <div>
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  {currentItem.content_type} Assessment
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentItem.title || `Question ${currentIndex + 1}`}
                </h3>
              </div>
            </div>

            {/* Test Mode Security Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              <VolumeX className="w-3.5 h-3.5 text-amber-700" />
              <span>Reference Audio Disabled</span>
            </div>
          </div>

          {/* Optional Illustration Image */}
          {currentItem.image_url && (
            <div className="mb-6 flex justify-center">
              <img 
                src={currentItem.image_url} 
                alt={currentItem.title || 'Question illustration'}
                className="max-h-56 sm:max-h-64 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            </div>
          )}

          {/* Question Text Prompt */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center my-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Read aloud into your microphone:
            </span>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 leading-relaxed tracking-tight">
              "{currentItem.text_content}"
            </p>
          </div>

          {/* Voice Recorder Component */}
          <div className="pt-2">
            <AudioRecorder 
              key={currentItem.id}
              initialAudioUrl={recordingsState[currentItem.id]?.url}
              onRecordingComplete={(blob, previewUrl) => handleRecordingComplete(currentItem.id, blob, previewUrl)}
              onReset={() => handleRecordingReset(currentItem.id)}
            />

            {/* Upload Status Feedback */}
            {recordingsState[currentItem.id]?.isUploading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-700 bg-blue-50 py-2 px-4 rounded-xl border border-blue-200">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Uploading voice recording to server...</span>
              </div>
            )}

            {recordingsState[currentItem.id]?.isUploaded && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-800 bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-200 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Voice recording saved for Question {currentIndex + 1}</span>
              </div>
            )}

            {recordingsState[currentItem.id]?.error && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-rose-800 bg-rose-50 py-2 px-4 rounded-xl border border-rose-200 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{recordingsState[currentItem.id].error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Bubbles Navigator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card mb-8">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3 text-center sm:text-left">
            Question Navigator
          </span>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {testItems.map((item, idx) => {
              const hasRecorded = recordingsState[item.id]?.isUploaded;
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                      : hasRecorded
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {idx + 1}
                  {hasRecorded && !isCurrent && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation & Submit Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 transition-colors ${
              currentIndex === 0 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-100 bg-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Question</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isLastQuestion ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.min(testItems.length - 1, prev + 1))}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all animate-pulse"
              >
                <Send className="w-4 h-4" />
                <span>Submit Voice Assessment</span>
              </button>
            )}
          </div>
        </div>

        {/* Finish / Early Submit Shortcut Button if not on last page */}
        {!isLastQuestion && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="text-xs font-semibold text-slate-500 hover:text-blue-800 underline transition-colors"
            >
              Ready to submit now? ({recordedCount} of {testItems.length} recorded)
            </button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* SUBMIT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 mx-auto flex items-center justify-center mb-4 shadow-xs">
              <FileCheck className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">
              Submit Test Assessment?
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              You have recorded voice submissions for <strong className="text-slate-900 font-semibold">{recordedCount}</strong> of <strong className="text-slate-900 font-semibold">{testItems.length}</strong> questions.
              {recordedCount < testItems.length && (
                <span className="block mt-2 text-rose-600 font-medium">
                  ⚠️ You have {testItems.length - recordedCount} unrecorded question(s).
                </span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Yes, Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXIT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {exitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 mx-auto flex items-center justify-center mb-4 shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Exit Assessment?
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              Your active test attempt will remain open, but any unrecorded questions will not be evaluated. Are you sure you want to exit?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExitConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Continue Test
              </button>
              <Link
                to="/tests/spoken-english"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Exit to Hub
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
