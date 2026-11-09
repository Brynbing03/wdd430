# Bakeoff 2 evaluation form draft

Use this draft when completing the official Bakeoff 2 evaluation form. Replace any wording that needs to match your personal experience, and add the deployed URL before submitting.

## Project

PicklePlay — a static SvelteKit tournament tracker for pickleball doubles.

## Architecture selected

Static rendering with SvelteKit and `@sveltejs/adapter-static`, with client-side hydration for forms, navigation, stores, bracket scoring, and tournament management.

## Technology stack

SvelteKit, Svelte, Vite, Netlify, Supabase Auth, Supabase PostgreSQL, browser local storage, and Node's built-in test runner.

## Core features completed

- Email/password sign-up, confirmation messaging, login, persistent sessions, and logout.
- Tournament setup with name, date, venue, court count, and draft/live/paused/complete status.
- Girls, boys, and mixed doubles divisions.
- Add, edit, remove, search, and reset teams.
- Standings with wins, losses, points, rank, and streak.
- Functional semifinal/final bracket with score validation and winner advancement.
- Court assignment, match time scheduling, and undo for the last result.
- Organizer profile and player participation directory.
- Supabase persistence with account ownership and RLS policies.
- Local browser fallback for demos and cloud outages.
- Responsive desktop/mobile layout with loading, empty, success, and error states.

## Verification completed

- `npm test`: 3 tests passed.
- `npm run check`: 0 Svelte errors and 0 warnings.
- `npm run build`: production static build succeeded.
- Manual verification still recommended before submission: create an account, confirm the email, log in, create data, refresh, log out, and test the deployed Netlify routes.

## Biggest success

The project grew from a visual concept into a complete tournament workflow. The organizer can move from setup to team management to bracket scoring, and the data remains available across routes and refreshes.

## Biggest challenge

Coordinating Supabase authentication, row-level security, relational tournament data, and local fallback persistence required the most debugging and design work.

## Would I use this stack again?

Yes, for a small or medium interactive application that benefits from a static deployment and a managed backend. For a larger application I would add end-to-end tests and split the persistence and domain logic into smaller modules earlier.

