# Deutsch Quest Team Workshop patch

This patch adds a realtime collaborative language workshop, separate from the multiple-choice raid.

## Included files
- `index.html`: workshop interface for ideas, shared phrase assembly, votes, and team presence.
- `src/main.js`: initializes the workshop and passes current Supabase auth/player details.
- `src/style.css`: responsive workshop styling.
- `src/teamWorkshop.js`: Supabase Realtime presence/broadcast collaborative state.

## Setup
1. Copy these files into the matching paths in the repository, replacing `index.html`, `src/main.js`, and `src/style.css`, and adding `src/teamWorkshop.js`.
2. Do not replace `src/config.js`, `supabase/schema.sql`, or `.github/workflows/deploy.yml`.
3. Commit to `main` and check GitHub Actions.
4. Sign in with two separate accounts/devices, enter the same workshop room code, and click Join lab on both.
5. Test idea sharing, phrase assembly, undo, voting, and team draft feedback.

The workshop uses Supabase Realtime Broadcast/Presence. Both players must sign in, the project URL and publishable key must be configured, and Realtime access must be permitted by the Supabase project's policies/settings. This is a collaborative MVP: the current shared board is broadcast-based and not server-authoritative. Do not use it for competitive rewards or sensitive content until persistent server-side state and authorization are added.
