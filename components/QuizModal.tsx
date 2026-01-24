import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface QuizModalProps {
  question: Question;
  onCorrect: () => void;
  onIncorrect: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ question, onCorrect, onIncorrect }) => {
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [flashError, setFlashError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);

  useEffect(() => {
    // Shuffle answers when question changes to avoid pattern matching
    const shuffled = [...question.answers].sort(() => Math.random() - 0.5);
    setShuffledAnswers(shuffled);
    setFlashError(false);
    setShowSuccess(false);
    setShowFailure(false);
  }, [question]);

  // Keyboard controls for answer selection
  useEffect(() => {
    if (showSuccess || showFailure) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === '1' || key === 'a') {
        if (shuffledAnswers[0]) handleAnswerClick(shuffledAnswers[0]);
      } else if (key === '2' || key === 'b') {
        if (shuffledAnswers[1]) handleAnswerClick(shuffledAnswers[1]);
      } else if (key === '3' || key === 'c') {
        if (shuffledAnswers[2]) handleAnswerClick(shuffledAnswers[2]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shuffledAnswers, showSuccess, showFailure]);

  useEffect(() => {
    if (!showSuccess) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onCorrect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSuccess, onCorrect]);

  const handleAnswerClick = (answer: string) => {
    if (showSuccess || showFailure) return; // Prevent double taps during transitions

    if (answer === question.correctAnswer) {
      setShowSuccess(true);
    } else {
      setShowFailure(true);
    }
  };

  return (
    // 1. Overlay: Fixed centering
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4">
      <div
        // 2. Container Configuration
        className={`
          relative flex flex-col
          w-[95%] max-h-[90vh]
          md:w-full md:max-w-2xl
          landscape:w-[95%] landscape:max-w-4xl landscape:max-h-[95vh]
          p-4 md:p-10 landscape:p-4
          overflow-y-auto
          rounded-xl shadow-2xl border-4 md:border-8 transition-colors duration-200
          ${flashError ? 'bg-red-950 border-red-500' : showSuccess ? 'bg-slate-900 border-green-500' : 'bg-slate-900 border-blue-500'}
        `}
      >
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
             <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 bg-green-900/30 rounded-full flex items-center justify-center mb-2 md:mb-4 border-2 border-green-500">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             </div>
             <h2 className="text-lg md:text-2xl font-bold text-green-400 mb-2 md:mb-4 uppercase tracking-widest text-center">Correct</h2>

             {question.explanation && (
               <div className="w-full bg-slate-800/80 p-3 md:p-5 rounded-lg border-l-4 border-amber-500 mb-4 md:mb-6 shadow-inner">
                 <p className="text-slate-200 font-serif text-xs md:text-base leading-snug italic text-center md:text-left">
                   "{question.explanation}"
                 </p>
               </div>
             )}

             <button
               onClick={onCorrect}
               className="px-6 py-2 md:px-8 md:py-3 bg-green-700 hover:bg-green-600 text-white font-bold text-sm md:text-lg rounded-lg transition-all uppercase tracking-widest shadow-lg active:scale-95"
             >
               Continue Journey
             </button>
          </div>
        ) : showFailure ? (
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
             <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 bg-red-900/30 rounded-full flex items-center justify-center mb-2 md:mb-4 border-2 border-red-500">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </div>
             <h2 className="text-lg md:text-2xl font-bold text-red-400 mb-2 md:mb-4 uppercase tracking-widest text-center">Incorrect</h2>

             {question.explanation && (
               <div className="w-full bg-slate-800/80 p-3 md:p-5 rounded-lg border-l-4 border-amber-500 mb-4 md:mb-6 shadow-inner">
                 <p className="text-slate-200 font-serif text-xs md:text-base leading-snug italic text-center md:text-left">
                   "{question.explanation}"
                 </p>
               </div>
             )}

             <button
               onClick={onIncorrect}
               className="px-6 py-2 md:px-8 md:py-3 bg-red-700 hover:bg-red-600 text-white font-bold text-sm md:text-lg rounded-lg transition-all uppercase tracking-widest shadow-lg active:scale-95"
             >
               Study & Try Again
             </button>
          </div>
        ) : (
          <>
            {/* Question Text */}
            <div className="grow flex items-center justify-center mb-6 md:mb-10 landscape:mb-4 px-2 pt-2">
              <p className="text-lg md:text-3xl landscape:text-xl text-slate-100 font-bold text-center leading-snug tracking-wide font-serif">
                {question.text}
              </p>
            </div>

            {/* Answers Grid */}
            <div className="
              grid gap-2 md:gap-4 landscape:gap-3 shrink-0
              grid-cols-1
              landscape:grid-cols-3
            ">
              {shuffledAnswers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(answer)}
                  className="
                    group relative w-full
                    py-3 md:py-5 landscape:py-3
                    px-3 md:px-6 landscape:px-3
                    rounded-lg bg-slate-800 hover:bg-blue-600
                    border-2 md:border-4 border-slate-700 hover:border-blue-300
                    transition-all active:scale-95 hover:scale-[1.02]
                    flex items-center landscape:flex-col landscape:justify-center landscape:text-center
                  "
                >
                  {/* Circle Indicator - Now more prominent */}
                  <span className="
                    flex-shrink-0
                    w-8 h-8 md:w-12 md:h-12 landscape:w-8 landscape:h-8
                    flex items-center justify-center rounded-full
                    bg-blue-600 group-hover:bg-blue-500
                    text-white
                    font-black text-sm md:text-xl landscape:text-sm
                    mr-3 md:mr-4 landscape:mr-0 landscape:mb-2
                    border md:border-2 border-blue-500 group-hover:border-blue-300
                    transition-colors shadow-lg
                  ">
                    {String.fromCharCode(65 + index)}
                  </span>

                  {/* Answer Text */}
                  <span className="text-white text-sm md:text-2xl landscape:text-sm font-semibold leading-tight">
                    {answer}
                  </span>
                </button>
              ))}
            </div>

            {/* Keyboard hint */}
            <p className="text-slate-500 text-xs mt-4 text-center">
              Press 1, 2, or 3 to select an answer
            </p>
          </>
        )}

        {/* Error Message */}
        {flashError && (
          <p className="mt-4 md:mt-6 landscape:mt-2 text-center text-red-400 font-bold animate-pulse text-sm md:text-xl landscape:text-sm shrink-0">
            Incorrect! Level Reset.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
