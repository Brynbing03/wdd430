# MealMate MVP Feature Portfolio

## Feature inventory

| ID | MVP feature | Classification | Depends on |
|---|---|---|---|
| F1 | App foundation and browser persistence | Infrastructure/supporting | None |
| F2 | Browse and inspect the recipe library | Independent after foundation | F1 |
| F3 | Favorite recipes and view profile summary | Blocked by another feature | F1, F2 |
| F4 | Assign recipes to a weekly meal plan | Blocked by another feature | F1, F2 |
| F5 | Create and save a personal recipe | Blocked by another feature | F1, F2 |

## Recommended implementation order

| Order | Feature ID | Depends on | Why this order |
|---:|---|---|---|
| 1 | F1-app-foundation | None | Establishes safe shared state and persistence. |
| 2 | F2-recipe-library | F1 | Provides the discovery and selection flow used by the other features. |
| 3 | F4-weekly-meal-planner | F1, F2 | Delivers the product’s central weekly-planning value. |
| 4 | F3-favorites-profile | F1, F2 | Reuses stable recipe cards and shared ids. |
| 5 | F5-personal-recipe | F1, F2 | Adds new records only after the library contract is stable. |

## Dependency map

```text
F1 foundation
├── F2 recipe library
│   ├── F3 favorites/profile
│   ├── F4 weekly planner
│   └── F5 personal recipe
└── shared browser persistence used by all features
```

## First feature and rationale

Implement F1 first because all other features depend on predictable recipe, favorite, and plan state. Fixing storage shape after the UI is built would create cross-feature regressions and make testing harder.

## Cross-feature risks

- Browser localStorage may contain malformed or stale data.
- Date-key handling can make a weekly plan appear to move or disappear around timezone boundaries.
- Shared recipe-card changes can break favorite, detail, planner, and personal-recipe flows at once.
- Scope can expand into accounts, sharing, images, nutrition, or grocery lists; these are intentionally outside the MVP.

## F1 browser persistence contract

F1 stores data only in the current browser's local storage. The app uses three separate keys:

- meal-recipes — an array of recipe objects
- meal-favorites — an array of recipe ids
- meal-plan — an object keyed by date-mealType with a recipe id value

Storage is not a server backup or an account. Clearing browser data removes saved MealMate data. Invalid or unavailable storage falls back to safe in-memory defaults; if a write fails, the app remains usable and shows a brief persistence warning.

## F2 recipe library contract

Recipe search is case-insensitive and matches recipe names and tags. Supported meal filters are All meals, Breakfast, Lunch, and Dinner. Selecting a recipe opens its details without clearing the current search or filter.

## F3 favorites and profile contract

Favorites are browser-local recipe-id relationships stored under meal-favorites. They do not copy or delete recipes, and the Profile view reports the current favorite count plus the number of recipes owned by You.

## F4 weekly planner contract

The planner stores one assignment per meal type and date in the browser-local meal-plan object. Each day has Breakfast, Lunch, and Dinner slots. Adding a recipe chooses the first open slot for its meal type; previous and next week navigation uses date-specific keys, and removing an assignment does not remove the recipe.

## F5 personal recipe contract

Personal recipes require a name, meal type, positive whole-number cooking time, at least one ingredient line, and instructions. Ingredients are trimmed by line and tags by comma before saving. New recipes receive owner You, a unique ID, and browser-local persistence under meal-recipes.

## Plan files

- [F1 — App foundation](F1-app-foundation.md)
- [F2 — Recipe library](F2-recipe-library.md)
- [F3 — Favorites/profile](F3-favorites-profile.md)
- [F4 — Weekly meal planner](F4-weekly-meal-planner.md)
- [F5 — Personal recipe](F5-personal-recipe.md)
- [Reflection](REFLECTION.md)
