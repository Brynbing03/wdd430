# Feature Implementation Plan: Browse and Inspect Recipes

## Metadata

| Field | Value |
|---|---|
| Feature ID / name | F2 — Browse and inspect the recipe library |
| Type | Independent after F1 |
| Severity | Critical — primary discovery flow |
| Status today | IMPLEMENTED as a visual prototype; edge cases and accessibility need review |
| Estimated effort | S — 1–2 days |
| Depends on | F1 app foundation and recipe data shape |
| Unblocks | F3 favorites/profile and F5 personal recipe creation |

## 1. Problem statement

Users need to find a meal quickly, understand whether it fits their schedule, and inspect its ingredients before adding it to the week. A grid of cards alone is not enough; search, meal-type filtering, and a detail view must agree on the same recipe data.

## 2. Goals

- Show starter and personal recipes in a readable library.
- Search recipe names and tags.
- Filter by Breakfast, Lunch, Dinner, or all meals.
- Open a detail modal with time, ingredients, instructions, ownership, and an add-to-plan action.
- Show a clear empty state when filters return no results.

## 3. Non-goals

- No external recipe search, scraping, ratings, comments, images, or recommendations.
- No editing or deleting recipes; creation is F5.

## 4. Personas and user stories

As a busy student, I want to search and filter simple recipes so that I can choose a meal without scanning every card. As a cook, I want to read ingredients and instructions before I add a recipe to my plan.

## 5. Functional requirements

- **FR-1 MUST:** The library MUST render every valid recipe as a card with name, time, meal type, and tags.
- **FR-2 MUST:** Search MUST match case-insensitively against recipe name and tags.
- **FR-3 MUST:** The meal-type filter MUST show only recipes matching the selected type, or all recipes for “All meals.”
- **FR-4 MUST:** Selecting a card MUST open a detail view without losing the current library filters.
- **FR-5 MUST:** The detail view MUST show ingredients, instructions, cooking time, and whether the recipe is community or personal.
- **FR-6 MUST:** No-results state MUST explain that the search/filter combination found nothing and suggest changing it.

## 6. Non-functional requirements

- Search and filtering should update without a network request or noticeable delay.
- Modal controls must be keyboard reachable and have accessible names.
- Recipe text must render as text, not untrusted HTML.
- Cards and the modal must remain readable on mobile.

## 7. Acceptance criteria

- **AC-1:** Given the Recipes tab is open, every valid starter recipe appears once.
- **AC-2:** Searching `quick` returns recipes tagged Quick and excludes unrelated recipes.
- **AC-3:** Selecting Dinner shows only Dinner recipes; selecting All meals restores the full list.
- **AC-4:** Clicking a card opens details with the same name, time, ingredients, and instructions as the card’s recipe object.
- **AC-5:** Closing details returns to the library with the previous query and filter intact.
- **AC-6:** A query with no matches shows a readable empty state and does not crash.
- **AC-7:** The detail action can pass the selected recipe to the planner flow.

## 8. Data model

The feature consumes `{id, name, type, time, tags, ingredients, instructions, color, owner}`. It must tolerate personal recipes added later and use safe empty arrays for missing tags or ingredients.

## 9. API surface

N/A — reads the shared in-memory recipe collection supplied by F1.

## 10. UI / UX

Use the existing RecipeLibrary, RecipeCard, and RecipeModal components. Keep search and filter controls above the grid, use a single detail modal, and provide visible close behavior plus click-outside behavior where appropriate.

## 11. AI / ML

N/A — no product AI is required.

## 12. Integration points

`MealPlanner.jsx` supplies recipes, filters, selection, favorites, and planner callbacks. `globals.css` controls card, grid, modal, empty-state, and responsive styling.

## 13. Dependencies and sequencing

Implement after F1. Verify this flow before F3 and F5 because both add data to or act on the library.

## 14. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Search assumes tags always exist | Medium / Medium | Normalize recipe data before filtering. |
| Modal becomes unusable on small screens | Medium / Medium | Test at 320px and preserve scrollable modal content. |
| Browse scope grows into a social recipe platform | High / Medium | Keep sharing, ratings, and recommendations out of scope. |

## 15. Rollout plan

Ship with starter data and verify the library before enabling personal recipe and planner integration. No migration or feature flag is needed.

## 16. Test plan

- Unit test case-insensitive search, tag matches, meal filtering, and no-result behavior.
- Integration test opening/closing details and preserving filters.
- Manual test keyboard modal use and 320px layout.

## 17. Documentation and training

Document searchable fields and supported meal filters in the plan README. No training is needed.

## 18. Open questions

- Should search eventually include ingredients and instructions?
- Should recipe cards expose an explicit “Add to plan” button as well as the detail action?

## 19. References

- `mealplanner-next/components/MealPlanner.jsx`
- `mealplanner-next/app/globals.css`

## Self-review and revisions

I changed “show recipes” into separate contracts for search, filtering, details, empty state, and state preservation. That makes the feature testable without requiring any backend or recommendation behavior.
