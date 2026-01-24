// CONFIGURATION
const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL as string | undefined;
const GAME_API_SECRET = import.meta.env.VITE_GAME_API_SECRET as string | undefined;
const GAME_SLUG = import.meta.env.VITE_GAME_SLUG as string | undefined;

export const submitScore = async (name: string, score: number, completed: boolean, userId?: string | null): Promise<void> => {
  console.log(`[SubmitScore] Attempting to submit: Name=${name}, Score=${score}, Completed=${completed}, UserID=${userId}`);

  // Get User ID (Check args, then URL)
  const finalUserId = userId || new URLSearchParams(window.location.search).get('userId');

  // Submit to Main App (My Year in the Chair)
  if (finalUserId) {
    if (!MAIN_APP_URL || !GAME_API_SECRET || !GAME_SLUG) {
      console.error('[SubmitScore] Missing Env Vars. Skipping Main App submission.');
      return;
    }

    const normalizedMainAppUrl = MAIN_APP_URL.replace(/\/+$/, '');
    try {
      console.log('[SubmitScore] Sending to Main App...');
      const response = await fetch(`${normalizedMainAppUrl}/api/mini-games/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: GAME_API_SECRET,
          userId: finalUserId,
          gameSlug: GAME_SLUG,
          score: score,
        }),
      });

      if (!response.ok) {
        console.error('[SubmitScore] Main App Rejected:', await response.text());
      } else {
        console.log('[SubmitScore] Main App Success');
      }
    } catch (err) {
      console.error('[SubmitScore] Main App Network Error:', err);
    }
  } else {
    console.warn('[SubmitScore] SKIPPING Main App: No userId found. Ensure ?userId=... is in the URL.');
  }
};
