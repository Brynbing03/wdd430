# Bakeoff 3 research

## What I researched

For Bakeoff 3 I researched how to build a client-side rendered application with Next.js and React. I used the official Next.js documentation about Server and Client Components as my main guide. I also used the official Supabase React and JavaScript Auth documentation to understand sign-up, login, session state, and the browser client. Finally, I read the Supabase documentation about Row Level Security so that user ratings and comments would be protected in the database and not only in the interface.

My goal was not to build a complete production application. I wanted to understand enough of the stack to build a working prototype for FryRank in the two-week time limit.

## Sources

- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Supabase: Use Supabase Auth with React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase JavaScript `signUp` reference](https://supabase.com/docs/reference/javascript/auth-signup)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## What I learned from the research

The main thing I learned from the Next.js documentation is that a file becomes a Client Component when it uses the `'use client'` directive. Client Components are the right place for state, event handlers, effects, and browser APIs. That matched what I needed for FryRank because the browse page has search, filters, sorting, loading state, and data that changes while the user is on the page.

I also learned that not every file needs to be a Client Component. Next.js still uses Server Components by default, so the client boundary should be placed where the interactive behavior starts. For this prototype, I kept the main interactive pages client-side because that made the data flow easier for me to understand and demonstrated the architecture required for this bakeoff.

The Supabase research showed me how the browser client can call Auth methods such as `signUp` and `signInWithPassword`, then use the current session to identify the user. I used that pattern for the FryRank sign-up, login, logout, and profile flows. I also used environment variables for the public Supabase project values instead of putting project configuration directly into the components.

The most important security idea I learned was that authentication and authorization are different. Authentication tells the app who the user is, but Row Level Security determines which rows that user is allowed to change. Supabase's `auth.uid()` helper lets a database policy compare the signed-in user's ID to the owner of a rating, comment, or profile row.

## How I applied the research

I applied the research in these parts of FryRank:

- `app/page.js` is a Client Component because it manages search, filters, sorting, Supabase requests, and loading state in the browser.
- `app/fries/[slug]/page.js` is a Client Component because users can choose a rating, submit comments, edit their own comments, and delete their own content without leaving the page.
- `app/profile/page.js` is a Client Component because it loads the signed-in user's activity and lets the user update their display name.
- `components/AuthForm.js` uses Supabase Auth for account creation and password login.
- `components/AuthStatus.js` listens for authentication changes and displays the correct login, profile, or logout controls.
- `supabase/schema.sql` enables Row Level Security on the application tables.
- The ratings and comments policies compare `auth.uid()` with the row's `user_id`, so a user cannot edit or delete another user's content through a direct database request.
- The rating control was built manually with five buttons instead of using a rating library. This was the feature I intentionally kept in the driver's seat so I could understand the React state, validation, database write, and refreshed average-score behavior.

## Why this stack made sense for my prototype

Next.js and React gave me a familiar component-based way to organize the interface while still letting me try a client-side rendering approach. Supabase gave me authentication and a PostgreSQL database without requiring me to build a separate server during a short bakeoff. The combination let me spend my time on the core fry-ranking experience: browsing fries, seeing community scores, and contributing ratings and comments.

There were tradeoffs. The browser does more work because it loads and filters the catalog on the client, and a bigger production application would need stronger server-side loading, pagination, moderation, image attribution, and more complete testing. For this assignment, the simpler client-side data flow helped me finish a working prototype and understand how the pieces fit together.

## What I would improve next

If I continued this project, I would add automated tests for the RLS policies, test with two separate accounts more thoroughly, improve the deployment workflow, and decide whether some public catalog loading should move back to Server Components. I would also add a clearer image attribution system before treating the site as a public production application.
