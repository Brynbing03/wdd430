# Feature Implementation Plan: Weekly Meal Planner

## Metadata

| Field | Value |
|---|---|
| Feature ID / name | F4 — Assign recipes to a weekly meal plan |
| Type | Blocked by F1 and F2 |
| Severity | Critical — core product value |
| Status today | IMPLEMENTED as a prototype; collision, removal, and persistence behavior need verification |
| Estimated effort | M — 2–4 days |
| Depends on | F1 shared persistence and F2 recipe selection |
| Unblocks | Final MVP demonstration |

## 1. Problem statement

MealMate’s central promise is turning recipe ideas into a practical week. Users need to view Monday–Sunday meal slots, add a recipe to an open slot, move between weeks, and remove assignments without losing them on refresh.

## 2. Goals

- Display breakfast, lunch, and dinner slots for seven days.
- Add a chosen recipe to the first open slot matching its meal type.
- Navigate to previous and next weeks.
- Remove an assigned meal without deleting the recipe.
- Persist assignments in browser storage.

## 3. Non-goals

- No nutrition calculations, grocery lists, drag-and-drop, calendar integrations, reminders, or recurring schedules.

## 4. Personas and user stories

As a busy student, I want to place recipes into a weekly grid so that I can see what I plan to eat. As a flexible planner, I want to remove a meal when plans change without changing my recipe library.

## 5. Functional requirements

- **FR-1 MUST:** The planner MUST show seven dates and three meal-type rows.
- **FR-2 MUST:** An empty slot MUST provide an obvious route to browse recipes.
- **FR-3 MUST:** Adding a recipe MUST assign it to an available date slot for that recipe’s meal type.
- **FR-4 MUST:** If all matching slots are full, the app MUST leave the plan unchanged and explain why.
- **FR-5 MUST:** Users MUST be able to remove an assignment without removing the recipe or favorite.
- **FR-6 MUST:** Previous/next week navigation MUST update displayed dates and use date-specific storage keys.
- **FR-7 MUST:** The plan MUST persist under `meal-plan`.

## 6. Non-functional requirements

- The grid must remain usable through horizontal scrolling on small screens.
- Assignment and removal should update immediately.
- Buttons and meal cells need accessible names and keyboard access.

## 7. Acceptance criteria

- **AC-1:** The planner displays exactly seven day columns and Breakfast, Lunch, and Dinner rows.
- **AC-2:** Adding a Breakfast recipe places it in an open Breakfast slot and displays its name and time.
- **AC-3:** Adding when all matching slots are full does not overwrite an existing assignment and shows a message.
- **AC-4:** Removing an assignment clears only that slot; the recipe remains in Recipes.
- **AC-5:** Previous and next week show different dates and preserve each week’s assignments separately.
- **AC-6:** Refreshing restores assignments from `meal-plan`.
- **AC-7:** A planned recipe can reopen its detail view.

## 8. Data model

The plan object uses keys such as `2026-10-05-Breakfast` and numeric recipe ids as values. The displayed recipe is resolved from the shared recipe collection, so deleting or changing a recipe requires a stale-reference decision.

## 9. API surface

N/A — client-only state and localStorage.

## 10. UI / UX

Use the existing Planner grid, previous/next buttons, empty-meal buttons, planned-recipe buttons, and remove affordance. On mobile, preserve horizontal scrolling and keep day labels attached to columns.

## 11. AI / ML

N/A.

## 12. Integration points

`MealPlanner.jsx` owns week calculation, plan state, add/remove callbacks, and recipe lookup. F2 detail actions call the planner add flow. F1 provides persistence.

## 13. Dependencies and sequencing

Implement after F1 and F2. Test with starter recipes first, then repeat with a personal recipe from F5.

## 14. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Week keys mix local time and UTC | Medium / High | Centralize date-key generation and test week boundaries. |
| Full slots overwrite meals | Medium / High | Find an open slot first and explicitly handle no match. |
| Stale recipe ids render blank cells | Medium / Medium | Show a recoverable placeholder and allow removal. |

## 15. Rollout plan

Verify date navigation and persistence with a clean storage key before the final demo. No server migration is required.

## 16. Test plan

- Unit test Monday calculation, date keys, open-slot selection, full-slot behavior, and remove behavior.
- Integration test add from detail view, navigate weeks, refresh, and reopen a planned recipe.
- Manual horizontal-scroll and keyboard test.

## 17. Documentation and training

Document that the planner stores a browser-local week and that each meal type has one slot per day.

## 18. Open questions

- Should adding a recipe let users choose a specific day instead of first-open placement?
- What should happen to a plan entry if a future version deletes its recipe?

## 19. References

- `mealplanner-next/components/MealPlanner.jsx`
- `mealplanner-next/app/globals.css`

## Self-review and revisions

I made slot selection and full-week behavior explicit. The most important correction was treating week/date keys as a data concern rather than only a visual calendar concern.
