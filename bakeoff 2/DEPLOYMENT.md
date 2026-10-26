# PicklePlay deployment

PicklePlay is configured for a static Netlify deployment.

1. Connect the GitHub repository to Netlify.
2. Use the repository root as the project directory.
3. Netlify will use `netlify.toml` to run `pnpm build` and publish `build/`.
4. Add these environment variables in Netlify, using the values from `.env.local`:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. In Supabase Authentication settings, add the deployed site URL to the allowed redirect URLs.

The SPA fallback keeps direct navigation to `/`, `/teams`, and `/bracket` working after deployment.
