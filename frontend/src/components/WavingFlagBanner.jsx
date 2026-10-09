import React, { useState } from 'react';
import { Sparkles, Flag, X } from 'lucide-react';

export default function WavingFlagBanner({ title, subtitle, onClose }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md border border-amber-300 relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
      
      {/* Background waving decorative flag effect */}
      <div className="absolute -right-4 -bottom-6 opacity-15 pointer-events-none transform rotate-12">
        <Flag className="w-32 h-32 fill-current" />
      </div>

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          
          {/* Animated Waving Flag Icon */}
          <div className="w-11 h-11 rounded-2xl bg-white/90 border border-amber-200 flex items-center justify-center text-amber-900 shadow-xs shrink-0 animate-bounce">
            <span className="text-2xl transform hover:scale-125 transition-transform select-none" role="img" aria-label="Waving Flag">
              🚩
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full">
                Ready, Set, Go!
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-900 animate-spin" />
            </div>
            <h4 className="text-sm font-bold font-serif text-slate-950 mt-0.5">
              {title || "Assessment Started! Take your time, stay focused, and do your best!"}
            </h4>
            {subtitle && (
              <p className="text-xs text-amber-950/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            className="p-1 rounded-full text-slate-800 hover:bg-black/10 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

