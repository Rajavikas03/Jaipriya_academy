import React, { useState, useRef, useEffect } from 'react';

/**
 * Interactive Audio Recorder Component for Practice and Independent Testing.
 * Uses MediaRecorder API with live recording indicator, timer, review playback, and re-record capability.
 */
export default function AudioRecorder({
  onSave,
  onRecordingComplete,
  onReset,
  initialAudioUrl = null,
  existingAudioUrl = null,
  buttonLabel = 'Save Recording',
  saveOnStop = false,
  maxDuration = 60,
  disabled = false,
  className = '',
}) {
  const initialUrl = initialAudioUrl || existingAudioUrl || null;
  const [status, setStatus] = useState(initialUrl ? 'recorded' : 'idle'); // 'idle' | 'recording' | 'recorded' | 'saving'
  const [recordTime, setRecordTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(initialUrl);
  const [audioBlob, setAudioBlob] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const previewAudioRef = useRef(null);
  const streamRef = useRef(null);

  // Sync if initialUrl changes
  useEffect(() => {
    const nextUrl = initialAudioUrl || existingAudioUrl || null;
    if (nextUrl && nextUrl !== audioUrl && status === 'idle') {
      setAudioUrl(nextUrl);
      setStatus('recorded');
    }
  }, [initialAudioUrl, existingAudioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
      if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startTimer = () => {
    setRecordTime(0);
    timerIntervalRef.current = setInterval(() => {
      setRecordTime((prev) => {
        if (prev >= maxDuration - 1) {
          stopRecording();
          return maxDuration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMsg(null);
    if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine supported mimeType
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopStream();
        const blobType = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: blobType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setStatus('recorded');

        if (onRecordingComplete) {
          onRecordingComplete(blob, url);
        }

        if (saveOnStop && onSave) {
          handleSave(blob);
        }
      };

      mediaRecorder.start(200); // 200ms slices
      setStatus('recording');
      startTimer();
    } catch (err) {
      console.error('Microphone error:', err);
      stopStream();
      setStatus('idle');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Microphone access denied. Please allow microphone permissions in your browser.');
      } else {
        setErrorMsg(err.message || 'Unable to access microphone. Please check your audio settings.');
      }
    }
  };

  const stopRecording = () => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleReset = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setIsPlayingPreview(false);
    if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordTime(0);
    setStatus('idle');
    setErrorMsg(null);

    if (onReset) {
      onReset();
    }
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current || !audioUrl) return;

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch((err) => console.warn('Preview playback failed:', err));
    }
  };

  const handleSave = async (blobToSave = audioBlob) => {
    if (!blobToSave || !onSave) return;
    setStatus('saving');
    setErrorMsg(null);
    try {
      await onSave(blobToSave);
      setStatus('recorded');
    } catch (err) {
      console.error('Save recording error:', err);
      setErrorMsg(err.message || 'Failed to upload recording. Please try again.');
      setStatus('recorded');
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className={`p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/90 rounded-2xl shadow-sm ${className}`}>
      {/* Error Message */}
      {errorMsg && (
        <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <svg className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="flex-1">{errorMsg}</p>
        </div>
      )}

      {/* State 1: IDLE */}
      {status === 'idle' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Ready to Record</p>
              <p className="text-xs text-slate-500">Click to record your pronunciation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-red-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span>Start Recording</span>
          </button>
        </div>
      )}

      {/* State 2: RECORDING */}
      {status === 'recording' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-red-500/5 rounded-xl border border-red-200">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
              <span className="absolute w-full h-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>

            {/* Live animated waveform bars */}
            <div className="flex items-center gap-1 h-6 px-2">
              <span className="w-1 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s] h-4"></span>
              <span className="w-1 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s] h-6"></span>
              <span className="w-1 bg-red-500 rounded-full animate-bounce [animation-delay:0s] h-3"></span>
              <span className="w-1 bg-red-600 rounded-full animate-bounce [animation-delay:-0.2s] h-5"></span>
              <span className="w-1 bg-red-500 rounded-full animate-bounce [animation-delay:-0.4s] h-4"></span>
            </div>

            <div>
              <p className="text-xs font-bold text-red-700 tracking-wider uppercase">Recording Voice...</p>
              <p className="text-sm font-mono font-bold text-slate-800">{formatTimer(recordTime)} / {formatTimer(maxDuration)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {/* State 3: RECORDED / PREVIEW / SAVING */}
      {(status === 'recorded' || status === 'saving') && audioUrl && (
        <div className="flex flex-col gap-3">
          {/* Hidden preview audio element */}
          <audio
            ref={previewAudioRef}
            src={audioUrl}
            preload="none"
            onEnded={() => setIsPlayingPreview(false)}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-amber-200">
            <div className="flex items-center gap-3">
              {/* Play preview button */}
              <button
                type="button"
                onClick={togglePreviewPlay}
                className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                title={isPlayingPreview ? 'Pause playback' : 'Listen to your voice'}
              >
                {isPlayingPreview ? (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div>
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Recording Captured {recordTime > 0 ? `(${formatTimer(recordTime)})` : ''}
                </p>
                <p className="text-xs text-slate-500">Listen to review or re-record if needed</p>
              </div>
            </div>

            {/* Actions: Re-record & Save */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                disabled={status === 'saving'}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Re-Record</span>
              </button>

              {!saveOnStop && onSave && (
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={status === 'saving'}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {status === 'saving' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{buttonLabel}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

