# PicklePlay — Bakeoff 2 reflection

## What I built

For Bakeoff 2 I built PicklePlay, a SvelteKit static-rendered tournament tracker for pickleball doubles. The prototype supports authentication, tournament setup, three divisions, team management, standings, bracket scoring, scheduling, player summaries, Supabase persistence, and local browser fallback behavior.

## Why I chose this stack

I chose SvelteKit in static mode because it supports the static architecture required for this bakeoff while still providing client-side hydration for interactive forms and tournament state. Svelte stores made it straightforward to share the selected division, teams, match results, and tournament settings across the dashboard, teams, and bracket routes. Supabase provided a practical way to add authentication and account-scoped PostgreSQL data without building a separate server API.

## What I learned

The biggest learning experience was managing shared reactive state across multiple Svelte routes. I learned how derived stores can calculate active standings, player summaries, bracket participants, and next-match information from a smaller source of truth. I also learned how a static SvelteKit deployment still needs client-side hydration and a fallback route so refreshed nested URLs continue to work.

The bracket workflow was my hands-on learning feature. I implemented score parsing, tie prevention, winner advancement, ranking updates, scheduling, and undo behavior as application logic. Writing small tests for those rules made it easier to separate predictable logic from UI code.

## Challenges

Authentication and persistence were more difficult than the visual interface. Supabase requires the browser session, database ownership checks, relationships between tournaments and divisions, and row-level security policies to agree. I also had to plan for failed network requests so that a local demo would remain usable and would tell the organizer when cloud synchronization failed.

Another challenge was keeping the bracket understandable when there are not enough teams, when one semifinal is incomplete, or when the final has not yet been created. Explicit empty and upcoming states made those situations clearer than assuming every tournament starts with a complete bracket.

## What went well

The final prototype has a focused user workflow and more depth than a static mockup. Changes made on the Teams page are reflected in the dashboard and bracket. The interface includes responsive layouts, keyboard-friendly modal controls, confirmation before destructive actions, validation messages, and a demo reset path. The code also passed the Svelte checker and production build in addition to the unit tests.

## What I would improve next

For a production version I would add end-to-end browser tests for sign-up, login, cloud persistence, and direct navigation. I would also add stronger match-history editing, more flexible bracket sizes, organizer roles, and clearer offline synchronization conflict handling. I would improve the database test setup so the Supabase policies and migrations are verified automatically rather than only through manual testing.

## Stack evaluation

SvelteKit was a good fit for this prototype because it made the static deployment simple while keeping interactive behavior approachable. Supabase reduced backend setup time and gave the project authentication and row-level security. The main tradeoff is that the client-side store and persistence layer became fairly large, so a bigger application would benefit from more deliberate domain modules and end-to-end tests. I would consider using this stack again for a small-to-medium interactive application with a mostly static shell and a managed backend.

