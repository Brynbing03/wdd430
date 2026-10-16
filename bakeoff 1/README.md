# MealMate

MealMate is a simple weekly meal planner for people who want an easier way to organize recipes, favorites, and meals for the week.

I built this project with Next.js, React, and Supabase. The goal was to make the app feel calm and easy to use while still practicing real authentication, database storage, responsive design, and form validation.

## What the app can do

- Create an account, log in, and log out
- Browse and search recipes
- Filter recipes by meal type
- Save recipes as favorites
- Add personal recipes
- Add recipes to a weekly meal plan
- Move between different weeks
- Keep recipes, favorites, and meal plans saved in Supabase
- Use the app on desktop or a phone-sized screen
- Show helpful validation messages when something is missing or incorrect

## Tech used

- Next.js
- React
- Supabase Auth
- Supabase PostgreSQL
- CSS

## Getting started

### 1. Install the project dependencies

From the project folder, run:

```bash
pnpm install
```

If your Terminal says that Node cannot be found, add the bundled Node runtime to your current Terminal session first:

```bash
export PATH="/Users/brynleebingham/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
```

You can check that Node is working with:

```bash
node --version
```

### 2. Set up Supabase

Create a Supabase project and add these values to a file named `.env.local` in the project folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

The `.env.local` file should stay private and should never be committed to GitHub.

The database uses these tables:

- `profiles`
- `recipes`
- `favorites`
- `meal_plan_entries`

Row-level security policies are enabled so users can only change their own private data.

For local class-project testing, email confirmation is disabled in Supabase. This lets test accounts log in without waiting for a confirmation email.

### 3. Start the app

Run:

```bash
pnpm dev
```

Then open:

http://localhost:3000

If port 3000 is already being used, the app may open on port 3001 instead. The Terminal will show the correct address.

## How to test it

1. Create a new account.
2. Log out and log back in.
3. Try an incorrect password and confirm that an error appears.
4. Open the recipe library and search for a recipe.
5. Favorite a recipe and check the Favorites page.
6. Add a personal recipe and refresh the page.
7. Add a recipe to the weekly meal plan.
8. Refresh the page and confirm the meal is still there.
9. Resize the browser to a phone width and check the layout.
10. Open Supabase → Authentication → Users and confirm the account appears.

## Production build

To check that the project can build successfully, run:

```bash
pnpm build
```

## Project documentation

The feature plans and project reflection are in the `docs/plans` folder:

- [Feature plan overview](docs/plans/README.md)
- [F1: App foundation](docs/plans/F1-app-foundation.md)
- [F2: Recipe library](docs/plans/F2-recipe-library.md)
- [F3: Favorites and profile](docs/plans/F3-favorites-profile.md)
- [F4: Weekly meal planner](docs/plans/F4-weekly-meal-planner.md)
- [F5: Personal recipe](docs/plans/F5-personal-recipe.md)
- [AI reflection](docs/plans/REFLECTION.md)

## A quick note about the project

This project started as a wireframe-inspired meal planner and grew into a working application. I used AI as a planning and coding assistant, but I tested the features, made design decisions, checked the scope, and adjusted the app as I went.
