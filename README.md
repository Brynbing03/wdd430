# PicklePlay — Bakeoff 2

PicklePlay is a SvelteKit tournament tracker for girls, boys, and mixed doubles. It uses Supabase authentication and account-scoped persistence, with browser storage available as a fallback for local demos.

## Current prototype

- Division switching for girls, boys, and mixed doubles
- Standings with wins, losses, streaks, and rank
- Bracket progress view with completed and upcoming matches
- Supabase-backed teams, players, tournament settings, standings, and completed bracket scores
- Local score/win updates with cloud synchronization when signed in
- Email/password sign-in and account-specific tournaments
- Responsive layout for desktop and mobile
- Color palette based on the supplied reference: warm yellow, teal, pink, gray, and mint

## Run locally

```bash
npm install
npm run dev
```

### Environment

Create `.env.local` from `.env.example` and provide the Supabase project URL and publishable key. The database foundation is in `supabase/migrations/20261026000000_pickleplay_foundation.sql`.

The prototype supports email/password accounts with email confirmation enabled. New users must verify their email before signing in. Users must be signed in to load or save cloud tournament data.

### Current scope

Bakeoff 2 is complete as a polished local/cloud prototype with pool-play history, multi-tournament selection, email confirmation, and deployment configuration in place. Remaining optional work is expanded end-to-end coverage for authentication and cloud persistence.

### Deployment

Netlify deployment is configured in `netlify.toml`. See `DEPLOYMENT.md` for the build settings, required Supabase environment variables, and redirect URL setup.
