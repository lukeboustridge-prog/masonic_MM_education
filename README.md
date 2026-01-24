<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ncd1AosiqIFazLCjj0S-xrEBuPAbXgxU

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Sprite Overrides

You can swap procedural sprites with PNG files without breaking the game.

1. Create `public/sprites/`.
2. Add PNGs named `wm.png`, `inner_guard.png`, or `officer.png`.
3. Add the filename (without extension) to `FILE_BASED_SPRITES` in `utils/assetGenerator.ts`.
4. PNGs listed in `FILE_BASED_SPRITES` override the procedural sprites.
