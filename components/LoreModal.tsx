import React, { useMemo } from 'react';
import { Orb } from '../types';
import { generateSpriteUrl } from '../utils/assetGenerator';

interface LoreModalProps {
  orb: Orb;
  onNext: () => void;
  speaker?: string;
  isIntro?: boolean;
}

const LoreModal: React.FC<LoreModalProps> = ({ orb, onNext, speaker, isIntro = false }) => {
  // Use procedural asset generator
  const spriteUrl = generateSpriteUrl(orb.spriteKey);

  // Determine button text based on context
  const buttonText = useMemo(() => {
    if (isIntro) return "Continue";
    if (orb.questionId !== undefined) return "Proceed to Quiz";
    if (orb.spriteKey === 'apron') return "Put On Apron";
    return "Collect";
  }, [isIntro, orb.questionId, orb.spriteKey]);

  return (
    // 1. Overlay: Fixed centering with padding
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div 
        // 2. Container: Compact Layout
        // max-h-[90vh] ensures it never goes off screen
        // Landscape: Use row layout and wider max-width
        className="
            relative w-[95%] max-w-lg landscape:max-w-2xl
            flex flex-col landscape:flex-row 
            items-center landscape:items-stretch
            gap-4
            p-4 md:p-6 rounded-xl shadow-2xl border-2 md:border-4 border-amber-500 bg-slate-900
            max-h-[90vh] landscape:h-auto
            transition-all duration-200
        "
      >
        {/* SECTION 1: Visuals (Top in Portrait, Left in Landscape) */}
        {!isIntro && (
          <div className="shrink-0 flex flex-col items-center justify-center landscape:w-1/3 landscape:border-r landscape:border-slate-700 landscape:pr-4">
              {speaker && (
                <p className="text-xs md:text-sm landscape:text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 text-center">
                  {speaker}
                </p>
              )}
              <h2 className="text-lg md:text-2xl landscape:text-base font-bold text-amber-400 text-center leading-none mb-2">{orb.name}</h2>
              <div className="h-1 landscape:h-0.5 w-16 bg-amber-600 rounded-full mb-3 landscape:mb-4"></div>
              
              <div className="p-3 bg-slate-800 rounded-full border-2 border-slate-700 shadow-inner">
                 <img 
                   src={spriteUrl} 
                   alt={orb.name}
                   className="w-16 h-16 md:w-24 md:h-24 landscape:w-16 landscape:h-16 object-contain"
                   style={{ imageRendering: 'pixelated' }}
                 />
              </div>
          </div>
        )}

        {/* SECTION 2: Content (Bottom in Portrait, Right in Landscape) */}
        <div className={`flex flex-col justify-between w-full ${isIntro ? '' : 'landscape:w-2/3 landscape:pl-2'}`}>
            <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto max-h-32 landscape:max-h-40 my-2 landscape:my-0 gap-2">
               {speaker && (
                 <p className="text-sm md:text-lg landscape:text-sm font-bold text-amber-400 text-center uppercase tracking-wider">
                   {speaker}
                 </p>
               )}
               <p className="text-sm md:text-lg landscape:text-sm text-slate-200 font-serif italic text-center leading-relaxed">
                   "{orb.blurb}"
               </p>
            </div>
            
            <button
              onClick={onNext}
              className="
                mt-2 landscape:mt-4
                w-full py-3 landscape:py-2 px-4
                bg-amber-600 hover:bg-amber-500 active:bg-amber-700
                text-white font-bold text-sm md:text-lg landscape:text-base tracking-wider uppercase
                rounded-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1
                transition-all shadow-lg
              "
            >
              {buttonText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoreModal;
