# PicklePlay — Bakeoff 2 implementation plan

## Goal

Build a two-week minimum viable prototype of PicklePlay, a tournament tracker for girls, boys, and mixed doubles pickleball divisions. The prototype prioritizes a working tournament workflow over a complete production system.

## Architecture and technology stack

- **Architecture:** static rendering with client-side hydration for interactive features.
- **Framework:** SvelteKit with `@sveltejs/adapter-static`.
- **Build and deployment:** Vite and Netlify with an SPA fallback for direct route navigation.
- **Database and authentication:** Supabase Auth and PostgreSQL with row-level security.
- **Fallback persistence:** browser local storage for demos and temporary cloud outages.
- **Testing:** Node's built-in test runner for pure scoring and ranking logic, plus SvelteKit checks and production builds.

## Prototype scope

The core user is a tournament organizer. The organizer should be able to:

1. Create an account and sign in.
2. Set up a tournament with a name, date, venue, courts, and status.
3. Switch between girls, boys, and mixed divisions.
4. Add, edit, remove, and search teams and players.
5. View standings and player participation summaries.
6. Record wins and bracket scores with validation.
7. Advance winners through a semifinal/final bracket.
8. Assign courts and match times.
9. Save tournament data to Supabase, with local storage as a fallback.
10. Reset a demo tournament and undo the last bracket result.

## Two-week task plan

### Days 1–2: foundation

- Create the SvelteKit static-rendering project.
- Establish shared layout, navigation, visual style, and mobile breakpoints.
- Define seeded divisions, teams, tournament settings, and profile data.

### Days 3–4: team management

- Build the dashboard and standings pages.
- Add division switching, team creation, editing, removal, and search.
- Add validation, confirmations, empty states, and success/error notices.

### Days 5–7: tournament workflow

- Build the bracket page.
- Generate semifinal and final matchups from standings.
- Validate and record scores, calculate winners, update standings, and support undo.
- Add court assignments, scheduling, and tournament status controls.

### Days 8–10: persistence and authentication

- Add Supabase email/password authentication.
- Create database tables, relationships, indexes, triggers, and RLS policies.
- Persist teams, players, tournaments, standings, match results, and history.
- Add local-storage fallback and safe handling for malformed saved data.

### Days 11–12: profile and polish

- Add organizer profile and preferences.
- Add player directory and participation cards.
- Improve keyboard behavior, loading states, responsive layout, and direct navigation.

### Days 13–14: verification and submission

- Run unit tests, `svelte-check`, and the production build.
- Test sign-up, confirmation, login, logout, refresh, direct routes, cloud persistence, and fallback behavior manually.
- Deploy to Netlify and verify redirect behavior.
- Complete the Bakeoff 2 evaluation form and submit this plan and reflection.

## Definition of done

The prototype is done when a signed-in organizer can complete a tournament workflow from setup through bracket scoring, see immediate feedback, refresh without losing valid data, and use the interface on desktop and mobile. Invalid input must not corrupt existing data, and the production build must complete successfully.

## Manual learning feature

The bracket-scoring workflow was treated as the manual learning feature. The scoring rules, winner calculation, ranking behavior, match advancement, and validation were implemented and tested as explicit application logic rather than relying on a third-party tournament component. This provided hands-on practice with Svelte stores, reactive derived state, event handlers, and client-side validation.

