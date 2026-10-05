# Feature Implementation Plan: Favorites and Profile Summary

## Metadata

| Field | Value |
|---|---|
| Feature ID / name | F3 — Favorite recipes and view profile summary |
| Type | Blocked by F1 and F2 |
| Severity | Medium — improves return use but is not required to browse |
| Status today | IMPLEMENTED as a prototype; persistence and empty states need verification |
| Estimated effort | S — 1 day |
| Depends on | F1 persistence, F2 recipe cards/details |
| Unblocks | No other MVP feature |

## 1. Problem statement

Users need a short list of meals they already like so they can return to familiar options quickly. The profile should summarize favorites and personal recipes without pretending there is an account backend.

## 2. Goals

- Toggle a recipe as favorite from the card and detail view.
- Persist favorite ids in the browser.
- Provide a Favorites view showing only favorited recipes.
- Show profile counts for favorites and recipes created.
- Handle zero favorites clearly.

## 3. Non-goals

- No login, profile editing, public profile, sharing, ratings, or server sync.

## 4. Personas and user stories

As a student, I want to favorite meals I enjoy so that I can find them next time. As a user, I want my profile to tell me how many favorites and personal recipes I have in this browser.

## 5. Functional requirements

- **FR-1 MUST:** A favorite toggle MUST add or remove exactly one recipe id.
- **FR-2 MUST:** Favorite ids MUST persist under `meal-favorites`.
- **FR-3 MUST:** Favorites view MUST render only recipes whose ids are favorited.
- **FR-4 MUST:** Favorite state MUST be visible in both cards and the detail modal.
- **FR-5 MUST:** Profile MUST show favorite count and count of recipes with `owner: "You"`.
- **FR-6 MUST:** Empty favorites MUST show a helpful state and a path back to Recipes.

## 6. Non-functional requirements

- Buttons need accessible labels that communicate current state.
- Toggling should update immediately without a network request.
- Removing a favorite must not delete its recipe or alter the weekly plan.

## 7. Acceptance criteria

- **AC-1:** Clicking an unselected heart adds that recipe id and marks it favorited.
- **AC-2:** Clicking the same heart again removes only that id.
- **AC-3:** Refreshing after a toggle restores the same favorite state.
- **AC-4:** Favorites view excludes non-favorited recipes.
- **AC-5:** Profile counts update after favorite and personal-recipe changes.
- **AC-6:** With no favorites, the view explains how to favorite a recipe and provides a Recipes path.

## 8. Data model

Favorites are a deduplicated array of numeric recipe ids. A favorite is a relationship, not a copy of the recipe, so recipe edits do not require duplicate data updates.

## 9. API surface

N/A — client state and localStorage only.

## 10. UI / UX

Use the existing heart button on RecipeCard and RecipeModal. Use the Favorites tab badge for the count, and keep Profile’s saved-recipes section consistent with the Favorites view.

## 11. AI / ML

N/A.

## 12. Integration points

`MealPlanner.jsx` owns `favorites`, `toggleFavorite`, `savedRecipes`, and Profile props. F1 owns safe persistence; F2 supplies cards and detail interactions.

## 13. Dependencies and sequencing

Implement after F1 and F2. It is independent of F4 and should be completed before final portfolio testing because it touches shared recipe cards.

## 14. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Duplicate or stale ids appear in storage | Medium / Medium | Deduplicate ids and ignore ids with no matching recipe. |
| Favorite action accidentally opens the card | Medium / Medium | Stop event propagation and test both click targets. |

## 15. Rollout plan

Enable the tab and profile summary after library interactions are stable. Existing default favorites may remain for the prototype, but a clean-browser test must verify the empty state.

## 16. Test plan

- Unit test add/remove/deduplicate behavior.
- Integration test card and modal toggles, persistence, badge, profile counts, and empty state.
- Manual keyboard and screen-size check.

## 17. Documentation and training

Document that favorites are browser-local and are not an account feature.

## 18. Open questions

- Should removing a recipe automatically remove its favorite id?
- Should Profile list all personal recipes or only favorited recipes?

## 19. References

- `mealplanner-next/components/MealPlanner.jsx`
- `docs/plans/F1-app-foundation.md`
- `docs/plans/F2-recipe-library.md`

## Self-review and revisions

I separated favorite relationships from recipe records and added criteria for stale ids, empty state, and event behavior. This prevents “favorites” from becoming an undefined second recipe library.
