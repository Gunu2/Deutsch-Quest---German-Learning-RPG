# Deutsch Quest 🇩🇪

**Deutsch Quest** is a browser-based German-learning RPG starter project. Explore the Sonnenfeld village, approach Frau Marta, answer a German greeting question, and earn XP.

> Current status: **early development / playable foundation**. This repository is not yet a complete commercial release. The world, starter lesson bank for A1–C2, local XP, four UI languages, Supabase authentication wiring, profile persistence wiring, and a Realtime presence channel are implemented in code. Online functions require your own Supabase project and have not been validated against your live project.

## Revised gameplay (v0.3)

- Story-based language raids: three linked boss phases where German is the challenge, not random combat trivia.
- Solo raid with escalating phases, hearts, boss shield, contextual choices, hints, explanations, and XP rewards.
- Team raid room using Supabase Realtime presence/broadcast. Requires at least two signed-in players in the same room; real-world network behavior still needs testing.
- Six CEFR difficulty bands (A1-C2) with contextual fallback scenarios. These are starter scenarios, not a certified CEFR curriculum.
- Optional AI Quest Master via a Supabase Edge Function. The browser never receives the OpenAI secret. If the function is not deployed/configured, curated scenarios are used instead.
- Signup asks for a display name; the game UI and player list show names, not email addresses.

## Configure AI Quest Master (optional)

1. Deploy `supabase/functions/quest-master/index.ts` as a Supabase Edge Function named `quest-master` (Dashboard → Edge Functions, or the Supabase CLI).
2. Add `OPENAI_API_KEY` as an Edge Function secret. Optionally set `OPENAI_MODEL` (default: `gpt-4.1-mini`). Never put this secret in `src/config.js`, GitHub frontend code, or the browser.
3. Confirm the function requires authenticated access, then test the **Ask Quest Master** button. If it is unavailable, the game should show a curated fallback scenario.
4. AI-generated language content can still make mistakes. Treat it as practice content and review it before using it as formal assessment.

## Features in this repository

- Phaser 3 village scene with keyboard movement (WASD / arrow keys).
- NPC proximity and lesson interaction using **E** or the Talk button.
- Three starter lessons per CEFR level (A1-C2), with answer feedback and XP rewards. These are a small starter bank, not a complete or formally validated CEFR curriculum.
- XP stored locally; profile save/load code for Supabase. CEFR path unlocks are based on completing at least 80% of the previous level’s current lesson bank, rather than XP alone.
- UI language architecture for Indonesian, English, German, and Spanish.
- Supabase email/password signup and login wiring with display-name-only UI (email remains an authentication credential).
- Supabase Realtime presence/broadcast channel wiring for the village.
- Responsive layout for desktop and mobile browsers.
- GitHub Actions workflow to build and publish to GitHub Pages.

## Not finished yet

- Each CEFR level currently has six starter lessons. This is still a starter bank, not a complete or formally validated CEFR curriculum.
- Remote player positions have basic presence/broadcast sprite rendering code, but this has not been verified against a live Supabase project or network conditions.
- UI translations are partial; the lesson bank has only three starter items per CEFR level and needs expert review and expansion.
- No audio, speech recognition, pronunciation grading, inventory system, or quest editor yet. Boss raids are a first gameplay iteration and still need multi-device QA.
- XP reward validation is client-side. Do not treat it as cheat-resistant for a public competitive release.
- No live Supabase project has been configured or tested as part of this package.

## Requirements

- Node.js 20 or later
- npm
- A GitHub account for hosting
- A Supabase project for online accounts and multiplayer presence

## Run locally

1. Extract this repository.
2. Install Node.js 20+ if not already installed.
3. In a terminal, change directory to the project folder.
4. Install dependencies and start Vite:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite, usually `http://localhost:5173`.

The game can run locally without Supabase. Login and online presence will show a configuration notice until Supabase is configured. Run `npm test` to check the starter lesson data. Run `npm run build` to verify the production bundle once dependencies have installed successfully.

## Configure Supabase

1. Create a project at [Supabase](https://supabase.com/).
2. In the Supabase dashboard, open **Project Settings → API** (or API Keys depending on the dashboard version).
3. Copy the project URL and the **publishable/anon public key**. Never use the `service_role` secret in browser code.
4. Copy `src/config.example.js` to `src/config.js` and replace the two placeholder values:

   ```js
   export default {
     SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",
     SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
   };
   ```

5. Open **SQL Editor** in Supabase and run the contents of `supabase/schema.sql`.
6. In **Authentication → URL Configuration**, set your local development URL (for example `http://localhost:5173`) and your deployed GitHub Pages URL as allowed redirect URLs/site URL as appropriate.
7. Test signup, email confirmation (if enabled), login, profile creation, and presence with two separate browsers or devices.

`src/config.js` contains a public browser key. It is safe to publish only when Row Level Security is configured correctly. The provided SQL applies owner-only policies to profiles. Do not expose a service role key.

## GitHub Pages deployment

1. Create a new GitHub repository.
2. Upload all files from this folder, including `.github/workflows/deploy.yml`. Keep the directory structure intact.
3. Commit and push to the `main` branch.
4. In GitHub, open **Settings → Pages** and set the source to **GitHub Actions**.
5. Wait for the Actions workflow to complete, then open the Pages URL shown by GitHub.

### Important: Supabase configuration and static hosting

The GitHub Actions build needs `src/config.js`. For a quick personal test, you can commit `src/config.js` with only the public anon/publishable key after setting RLS correctly. For a shared/public repository, consider injecting public build values via GitHub Actions variables. Never commit a service-role secret. If you want the project to build without online features, leave the placeholder config and the game will operate in local mode.

## Controls

- **W / A / S / D** or **arrow keys**: move the character.
- **E**: talk to Frau Marta when nearby.
- Or tap **Bicara dengan NPC / Talk to NPC** when close to her.

## Project structure

```text
deutsch-quest/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── config.example.js
│   ├── config.js
│   ├── content.js
│   ├── i18n.js
│   ├── main.js
│   ├── style.css
│   └── supabaseClient.js
├── supabase/
│   └── schema.sql
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Recommended next milestones

1. Complete and review a CEFR-aligned lesson bank with answer explanations.
2. Render other online players in the game world and synchronize their movement reliably.
3. Add touch controls for mobile.
4. Add server-validated XP/quest rewards via Supabase Edge Functions.
5. Add audio and listening tasks; add speaking tasks only with clear privacy consent.
6. Test accessibility, security rules, reconnect behavior, and mobile performance before a public release.

## License

No license has been selected yet. Add a `LICENSE` file before redistributing under a specific license.
