# FryRank reflection

## Technology stack

FryRank uses Next.js with the App Router and React for the interface. Next.js provides the project structure and route organization, while React client components handle search, filters, sorting, authentication state, ratings, comments, and profile editing. Supabase provides authentication and PostgreSQL data storage. Supabase Row Level Security (RLS) protects user-owned writes at the database boundary. The styling is hand-written CSS so the visual system can stay small, responsive, and easy to inspect.

## Client-side rendering approach

The main interactive routes use the `'use client'` directive. The home page loads restaurants, fries, and ratings in the browser, then calculates rating summaries and applies search, filter, and sort state locally. The detail page loads the selected restaurant, ratings, comments, and public profile names after the route is visited. The profile page loads the current session and the signed-in user’s activity, then updates the interface immediately after successful mutations.

This approach met the bakeoff requirement to demonstrate client-side rendering and kept the data flow understandable. The tradeoff is that the browser performs more work and the catalog is not server-rendered with live data. A larger production version could move public catalog queries to server components or API routes while keeping authenticated mutations protected.

## Supabase authentication and RLS

Supabase Auth handles account creation, password login, logout, and session restoration. The browser client calls `auth.getUser()` to identify the current user. Signed-out visitors can browse restaurants, fries, ratings, and comments, but rating and comment controls redirect or disable themselves when authentication is required.

The database contains `profiles`, `restaurants`, `fries`, `ratings`, and `comments`. A signup trigger creates a profile row from the new Auth user’s metadata. RLS is enabled on every application table. Public read policies allow the community to see catalog data, ratings, comments, and display names. Insert, update, and delete policies compare `auth.uid()` with the row’s `user_id` or `id`, which means a malicious client cannot use the UI or a direct Supabase request to modify another user’s content.

The application also includes matching ownership filters in its update and delete queries. Those UI checks improve feedback and reduce accidental requests, while RLS remains the actual security boundary.

## Manually built rating feature

The rating feature was built manually rather than using a rating component library. Five buttons represent scores from one through five, with active state, accessible labels, and pressed state. The selected score is validated before submission. A unique database constraint on `(fry_id, user_id)` makes a second submission an update instead of a duplicate rating.

After a successful save or delete, the detail page reloads the rating data and recalculates the average. The browse page performs the same aggregation over public rating rows to show each fry’s current average and review count. This made the full feature visible from input through persistence, refresh, and public display.

## What I learned

The most important lesson was that authentication is not the same as authorization. Knowing who a user is only solves identification; RLS policies are what prevent that user from changing someone else’s rating or comment. Testing the owner-only controls made that distinction concrete.

Another lesson was the importance of keeping the local seed data and Supabase data shape compatible. The browse page needed a fallback because a catalog should still be understandable when a network request fails. Normalizing both sources into the same card shape made the fallback predictable without duplicating the UI.

The hardest part was coordinating several small states: loading, signed-out browsing, an existing user rating, comment ownership, edits, deletes, and refreshes. Clear feedback messages and reloading the affected data after mutations were more reliable than assuming an optimistic update had succeeded.

The project also showed where a prototype should stop. Curated fry records and local images were enough to demonstrate the product, but a larger version would need image attribution workflows, moderation, pagination, better server-side data loading, and a deployment pipeline.

## Limitations and next steps

The local production build passes and the routes have been browser-tested locally. A final hosted test still requires choosing a provider, adding the Supabase variables to that provider, and updating Supabase Auth’s site URL and redirect settings. Full two-account authorization testing also requires a second test account. Those are deployment and test-environment tasks rather than unresolved application behavior.
