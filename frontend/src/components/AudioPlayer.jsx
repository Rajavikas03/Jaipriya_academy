import React, { useState, useRef, useEffect } from 'react';

function resolveAudioUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `http://127.0.0.1:8000${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Responsive Custom Audio Player Component
 * Supports Play/Pause, seekbar scrubbing, volume toggle, and playback speed adjustment.
 */
export default function AudioPlayer({ src, title = 'Audio Playback', className = '' }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const resolvedSrc = resolveAudioUrl(src);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [resolvedSrc, playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current || !resolvedSrc) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Audio playback prevented:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 0.75, 1.25];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec) || timeInSec === 0) return '0:00';
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!resolvedSrc) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 ${className}`}>
        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
        <span>No audio available</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 p-3 bg-white/90 backdrop-blur border border-amber-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all ${className}`}>
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={resolvedSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="none"
      />

      <div className="flex items-center justify-between gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 active:scale-95 transition-transform"
          aria-label={isPlaying ? 'Pause pronunciation' : 'Play pronunciation'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Title & Time Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1">
            <span className="truncate flex items-center gap-1.5 font-semibold text-slate-800">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {title}
            </span>
            <span className="font-mono text-slate-500 text-[11px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Progress Slider */}
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-orange-500 transition-colors"
          />
        </div>

        {/* Speed button */}
        <button
          type="button"
          onClick={cycleSpeed}
          title="Playback speed"
          className="flex-shrink-0 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors"
        >
          {playbackRate}x
        </button>

        {/* Volume/Mute button */}
        <button
          type="button"
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
        >
          {isMuted ? (
            <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
