# Feature Implementation Plan: Create and Save a Personal Recipe

## Metadata

| Field | Value |
|---|---|
| Feature ID / name | F5 — Create and save a personal recipe |
| Type | Blocked by another feature |
| Severity | Medium — core user value, but the prototype remains usable without it |
| Status today | PARTIAL — editor and localStorage save exist, but validation and feedback are minimal |
| Estimated effort | S — 1–2 days |
| Depends on | F1 persistence, F2 recipe library, shared recipe data shape |
| Unblocks | Reliable personal recipe use and future edit/delete work |

## 1. Problem statement

Users need to add meals they actually cook so the planner reflects their real options. The current editor can save a recipe, but incomplete fields and invalid cooking times can create unusable recipe records.

## 2. Goals

- Collect name, meal type, positive whole-number time, ingredients, instructions, and optional tags.
- Validate required fields before saving.
- Store a personal recipe with `owner: "You"` and a unique id.
- Normalize ingredients and tags.
- Persist the recipe and show it in the library/profile.
- Support cancel without changing the recipe list.

## 3. Non-goals

- No login, account sync, image upload, import, sharing, ratings, or recommendations.
- No editing/deleting existing personal recipes in this slice.

## 4. Personas and user stories

As a student cook, I want to enter my own recipe so that I can plan meals I know how to make. I want validation and persistence so incomplete work does not silently become a saved recipe.

## 5. Functional requirements

- **FR-1 MUST:** The editor MUST open from Recipes and Profile.
- **FR-2 MUST:** Name, meal type, time, at least one ingredient, and instructions MUST be collected.
- **FR-3 MUST:** Time MUST be a positive whole number.
- **FR-4 MUST:** Ingredients MUST split into trimmed non-empty lines; tags MUST split into trimmed non-empty comma-separated values.
- **FR-5 MUST:** A valid new recipe MUST receive a unique id and `owner: "You"`.
- **FR-6 MUST:** A valid save MUST update the library, close the editor, show success feedback, and persist under `meal-recipes`.
- **FR-7 MUST:** Invalid save MUST keep the editor open and explain each correction.
- **FR-8 MUST:** Cancel/close MUST discard unsaved values.

## 6. Non-functional requirements

- Every field needs a visible label and keyboard access.
- Errors must not rely on color alone and should use `aria-invalid`/descriptions.
- The form must work on the existing mobile layout.
- Recipe text remains browser-local and is never inserted as HTML.

## 7. Acceptance criteria

- **AC-1:** Opening Add a recipe shows empty fields and Save/Cancel actions.
- **AC-2:** Blank required fields block save and show field-level messages.
- **AC-3:** Zero, negative, decimal, or nonnumeric time blocks save.
- **AC-4:** A valid save adds a visible personal recipe with normalized data and success feedback.
- **AC-5:** Blank lines and extra ingredient spaces are removed before storage.
- **AC-6:** Refreshing after save keeps the recipe in the library.
- **AC-7:** Cancel closes the editor without adding a recipe.
- **AC-8:** The Profile created count includes the new personal recipe.

## 8. Data model

```js
{ id, name, type, time, tags: string[], ingredients: string[], instructions, color, owner: "You" }
```

## 9. API surface

N/A — client-only localStorage feature.

## 10. UI / UX

Use the existing RecipeEditor modal. Keep typed values visible when errors appear, show errors near fields, focus the first invalid field when practical, and use the existing toast for successful saves.

## 11. AI / ML

N/A.

## 12. Integration points

`MealPlanner.jsx` owns editor state, save callback, library rendering, profile count, and `meal-recipes` persistence. `globals.css` owns modal/form/responsive styles.

## 13. Dependencies and sequencing

After F1 and F2. Implement validation and normalization before polishing feedback. Verify the new object through the library, profile, planner, and refresh flows.

## 14. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Malformed storage breaks personal recipes | Medium / High | Use F1 guarded reads and safe defaults. |
| Date.now id collision | Low / Medium | Check generated id against existing ids. |
| Scope expands into a recipe platform | High / Medium | Keep account, sharing, import, and images as non-goals. |

## 15. Rollout plan

Ship validation and persistence together after F2 is stable. No migration or feature flag is needed.

## 16. Test plan

- Unit test field validation and ingredient/tag normalization.
- Integration test valid save, invalid save, cancel, library visibility, profile count, and refresh persistence.
- Manual keyboard, mobile, malformed-storage, and storage-write failure checks.

## 17. Documentation and training

Document required fields and browser-local storage behavior. No training is needed.

## 18. Open questions

- Should users eventually edit/delete personal recipes?
- Should a new personal recipe be favorited automatically?

## 19. References

- `mealplanner-next/components/MealPlanner.jsx`
- `mealplanner-next/app/globals.css`
- `docs/plans/F1-app-foundation.md`
- `docs/plans/F2-recipe-library.md`

## Self-review and revisions

I narrowed “allow users to add recipes” into validation, normalization, ownership, persistence, cancellation, and profile visibility. I explicitly excluded account-backed behavior so the plan matches the current client-only prototype.
