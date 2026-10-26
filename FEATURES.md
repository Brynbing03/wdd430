# PicklePlay feature backlog

This is the working checklist for turning the current visual prototype into a functional tournament tracker. We will complete and verify each item in order.

## Already working

- [x] Dashboard route at `/`
- [x] Teams route at `/teams`
- [x] Bracket route at `/bracket`
- [x] Shared division state across pages
- [x] Switch between Girls, Boys, and Mixed divisions
- [x] Add a team through the Teams page modal
- [x] Record a win from the standings table
- [x] Re-rank teams after a recorded win
- [x] Shared responsive layout and single global navigation
- [x] PicklePlay logo with transparent background

## Phase 1 — Make the current data reliable

- [x] Persist teams and match results in browser storage so a refresh does not erase changes
- [x] Load saved tournament state safely when storage is missing or malformed
- [x] Add a reset-tournament action for starting a fresh event
- [x] Show clear success/error feedback after every data change
- [x] Prevent duplicate team names within the same division
- [x] Add form validation for team name and both player names

## Phase 2 — Complete team management

- [x] Edit an existing team
- [x] Remove a team with a confirmation step
- [x] Show the two player names as separate editable fields
- [x] Add team search/filtering for larger divisions
- [x] Show division team counts on the dashboard
- [x] Keep team changes synchronized across Dashboard and Teams pages

## Phase 7 — Supabase-backed accounts and persistence

- [x] Add email/password authentication with persistent sessions
- [x] Create account-specific tournaments and divisions
- [x] Persist teams, players, standings, and completed bracket matches in Supabase
- [x] Protect tournament data with row-level security policies
- [x] Keep local browser storage as a graceful fallback when cloud access is unavailable
- [x] Require email confirmation before first sign-in

## Phase 3 — Make the bracket functional

- [x] Generate bracket matchups from the teams in the selected division
- [x] Support selecting a division on the Bracket page
- [x] Record a match score
- [x] Validate scores before saving a match
- [x] Mark matches as upcoming, live, or completed
- [x] Advance the winning team to the next round
- [x] Update standings automatically from completed matches
- [x] Show an empty state when a division does not have enough teams

## Phase 4 — Tournament controls

- [x] Add tournament setup: name, date, venue, and number of courts
- [x] Add start/pause tournament controls
- [x] Add court assignments to matches
- [x] Add match scheduling and next-match ordering
- [x] Add a tournament status banner for draft, live, and complete
- [x] Add an undo action for the last recorded result

## Phase 5 — Player and profile features

- [x] Make the profile button open a real profile panel or page
- [x] Edit organizer name and tournament preferences
- [x] Show player/team participation summaries
- [x] Show wins, losses, points, and current streaks per team
- [x] Add a lightweight player directory

## Phase 6 — Quality and polish

- [x] Add loading, empty, and error states to every page
- [x] Add keyboard-accessible modals and controls
- [x] Add confirmation before destructive actions
- [x] Add mobile-friendly bracket scrolling and match cards
- [x] Add automated tests for ranking, match results, storage, and form validation
- [x] Test direct navigation and refresh behavior for every route
- [x] Add a small demo/reset dataset for presentations

## Suggested working order

1. Browser persistence and validation
2. Edit/remove teams
3. Functional division-aware bracket
4. Match scoring and automatic standings
5. Tournament setup and scheduling
6. Profile/player features
7. Tests and final polish

## Definition of done for each feature

- The user can complete the action from the UI.
- The result is visible immediately on the relevant page.
- The result remains correct after navigating to another page and refreshing.
- Invalid input produces a clear message without corrupting existing data.
- `pnpm check` passes before moving to the next feature.
