# FryRank

FryRank is a fast-food fry review and ranking website. Anyone can browse restaurants, fries, ratings, and comments. Only authenticated users can submit, edit, or delete ratings and comments.

This project was built for WDD 430 Bakeoff 3 as a client-side rendered prototype using Next.js, React, Supabase, and PostgreSQL. The current implementation includes public browsing, live Supabase rankings, authentication, profiles, ratings, comments, responsive polish, and local production-build verification.

## Project goals

The primary goal is to create a working prototype that demonstrates the core experience:

1. Browse real fast-food fry products.
2. View photos and details for each fry.
3. Compare fries using community ratings.
4. Let users create accounts and contribute ratings and comments.
5. Provide a responsive experience on desktop and mobile.

The project is intentionally scoped as an MVP. It does not need to support every restaurant, every location, or advanced social features during this bakeoff.

## Technology stack

- **Frontend:** Next.js and React
- **Rendering approach:** Client-side rendered interactive pages and components
- **Authentication:** Supabase Auth
- **Backend and database:** Supabase PostgreSQL
- **Database security:** Supabase Row Level Security policies
- **Styling:** CSS or a small CSS utility approach if added later
- **Deployment target:** Ready for Vercel, Netlify, or another Next.js-compatible host; provider deployment is not yet connected in this checkout
- **Image/data sources:** Curated seed data first, with an optional external places or image API later

Next.js is used as the React application framework, while the main application interactions run in client components. The browser Supabase client loads catalog data, reads the current session, submits ratings/comments, updates profiles, and refreshes UI state after mutations. Public route shells are still provided by the App Router, but the interactive data experience is intentionally client-side for this bakeoff.

## Current implementation status

Completed features include:

- Public browse page with Supabase-backed fries and live rating summaries.
- Search, restaurant/style filters, sorting, loading states, empty results, and local-data fallback.
- Restaurant detail pages with ratings, comments, author names, and owner-only edit/delete actions.
- Supabase sign-up, log-in, log-out, profile display-name editing, and session persistence.
- Profile page with the signed-in user’s ratings and comments.
- Broken-image fallback behavior, mobile navigation, accessible labels, and responsive layouts.
- Production build verification with `npm run build`.

The remaining deployment action is provider-specific: add the two `NEXT_PUBLIC_SUPABASE_*` variables to the selected host, configure the deployed URL in Supabase Auth, deploy, and test the hosted version.

## Core user experience

### Public visitors

Visitors do not need an account to:

- Open the website.
- Browse fry products.
- Search for restaurants or fries.
- Filter and sort fry results.
- View a restaurant page.
- View a fry detail page.
- See average ratings and rating counts.
- Read existing comments.
- View fry photos, descriptions, prices, styles, and locations.

When a visitor tries to rate or comment, the site should explain that an account is required and provide links to sign up or log in.

### Authenticated users

Authenticated users can:

- Create an account.
- Log in and log out.
- View a basic profile page.
- Submit one 1–5 star rating per fry.
- Edit or delete their own rating.
- Submit comments.
- Edit or delete their own comments.
- See their own rating on a fry detail page.
- Review their own contribution history on their profile.

## MVP feature list

### Application foundation

- [x] Create the Next.js application structure.
- [x] Establish the FryRank visual identity and layout.
- [x] Create responsive navigation.
- [x] Add loading, empty, error, and not-found states.
- [x] Add environment variable support.
- [x] Add a complete setup section to this README.

### Public browsing

- [ ] Build the home page.
- [ ] Build the fry browsing page.
- [x] Display fry cards with image, restaurant, name, score, and review count.
- [x] Add text search.
- [x] Add restaurant filtering.
- [x] Add fry-style filtering.
- [x] Add rating, review-count, and newest sorting.
- [x] Build restaurant detail pages.
- [x] Build fry detail pages.
- [ ] Make all public pages usable without authentication.

### Authentication

- [x] Create sign-up form.
- [x] Create log-in form.
- [x] Add log-out action.
- [x] Display authentication errors clearly.
- [x] Disable email confirmation for local class-project testing.
- [x] Preserve the signed-in session after refresh.
- [x] Add a profile page.
- [x] Add an authentication gate for rating and comment forms.

### Ratings

- [x] Build a 1–5 star rating input.
- [x] Validate that the rating is an integer from 1 through 5.
- [x] Allow one rating per user per fry.
- [x] Allow users to edit their own rating.
- [x] Allow users to delete their own rating.
- [x] Calculate and display average ratings.
- [x] Display the number of ratings.
- [x] Update the displayed score after a successful change.

### Comments

- [x] Build the comment list.
- [x] Build the comment form.
- [x] Require authenticated users to submit comments.
- [x] Prevent empty comments.
- [x] Enforce a reasonable maximum comment length.
- [x] Show the author and date.
- [x] Allow users to edit their own comments.
- [x] Allow users to delete their own comments.
- [x] Show useful database and validation errors.

### Responsive design and accessibility

- [x] Test desktop and responsive layouts.
- [x] Use readable type sizes and sufficient color contrast.
- [x] Make controls usable by keyboard and touch.
- [x] Add labels to form inputs.
- [x] Provide useful image alt text and broken-image fallbacks.
- [x] Make error messages understandable.
- [x] Ensure cards and forms do not overflow on small screens.

## Database design

The initial Supabase database should contain these tables.

### `profiles`

Stores public profile information connected to Supabase Auth.

- `id` - UUID, references `auth.users.id`
- `username` - unique text value
- `display_name` - text value
- `avatar_url` - optional text value
- `created_at` - timestamp

### `restaurants`

Stores fast-food restaurant information.

- `id` - UUID primary key
- `name` - text value
- `slug` - unique text value
- `description` - optional text value
- `website_url` - optional text value
- `logo_url` - optional text value
- `city` - optional text value
- `state` - optional text value
- `created_at` - timestamp

### `fries`

Stores individual fry products.

- `id` - UUID primary key
- `restaurant_id` - foreign key to `restaurants.id`
- `name` - text value
- `slug` - unique text value
- `description` - text value
- `style` - text value such as shoestring, crinkle, waffle, or steak fry
- `price` - optional numeric value
- `image_url` - text value
- `image_source_url` - optional text value
- `image_credit` - optional text value
- `location_note` - optional text value
- `created_at` - timestamp

### `ratings`

Stores one rating per user per fry.

- `id` - UUID primary key
- `fry_id` - foreign key to `fries.id`
- `user_id` - foreign key to `auth.users.id`
- `score` - integer from 1 through 5
- `created_at` - timestamp
- `updated_at` - timestamp
- Unique constraint on `fry_id` and `user_id`

### `comments`

Stores user comments about fries.

- `id` - UUID primary key
- `fry_id` - foreign key to `fries.id`
- `user_id` - foreign key to `auth.users.id`
- `body` - text value
- `created_at` - timestamp
- `updated_at` - timestamp

The average rating can be calculated from the `ratings` table. If performance becomes a concern, a database view or cached summary can be added later.

## Row Level Security rules

Supabase Row Level Security must be enabled for every application table.

### Public read access

Unauthenticated and authenticated visitors may read:

- Public profiles needed to identify comment authors
- Restaurants
- Fries
- Ratings
- Comments

### Authenticated write access

- Authenticated users may create ratings only for themselves.
- Authenticated users may create comments only for themselves.
- Users may update or delete only their own ratings.
- Users may update or delete only their own comments.
- Users may update only their own profile.
- No client user may create or edit restaurants or fries through the public application.

Restaurant and fry data will initially be seeded manually by the project owner.

## Image and external API strategy

There is not one dependable, free API containing accurate product photos for every fast-food fry. The first version should therefore use a controlled data strategy.

### Initial approach

- Start with 10–20 restaurants.
- Add curated fry records to Supabase.
- Use images that are legally permitted for the project.
- Store the image source and attribution with every image.
- Add a fallback image for broken or unavailable external images.

### Sources to evaluate

- Restaurant-provided images where usage is allowed
- Unsplash
- Pexels
- Wikimedia Commons
- Google Places Photos
- Yelp Fusion
- Foursquare Places

### Initial API recommendation

The first implementation will use curated fry records in Supabase and treat an external API as an optional enhancement. Google Places Photos can provide photos associated with a restaurant location, but it does not guarantee a clean product photo for a specific fry item and requires a photo name, API key, requested dimensions, and required attribution. See the [Google Places Photo documentation](https://developers.google.com/maps/documentation/places/web-service/place-photos).

Yelp Fusion and Foursquare Places are also possible sources for restaurant/place information, but their access, photo availability, attribution requirements, rate limits, and pricing need to be checked before they become a core dependency. See the [Yelp Fusion documentation](https://docs.developer.yelp.com/docs/getting-started) and [Foursquare Places API overview](https://docs.foursquare.com/fsq-developers-places/reference/places-api-overview).

For this two-week prototype, manually curated product data plus legally usable images is the reliable baseline. We can add a server-side API route later if one provider is selected.

External APIs may require keys, billing, attribution, rate limits, and compliance with their terms. API keys must remain in environment variables and must not be committed to GitHub.

The application should keep image URLs separate from the UI so that an image provider can be changed later without rebuilding the entire feature.

## Planned pages

- `/` - Home page with featured and highly rated fries
- `/fries` - Browse, search, filter, and sort fries
- `/fries/[slug]` - Fry detail page with rating and comments
- `/restaurants/[slug]` - Restaurant information and its fries
- `/login` - Log-in form
- `/signup` - Account creation form
- `/profile` - Current user profile and contribution history
- `/about` - Project explanation and image/source information

## Planned reusable components

- `Navbar`
- `MobileMenu`
- `FryCard`
- `RestaurantCard`
- `StarRating`
- `RatingForm`
- `CommentList`
- `CommentForm`
- `SearchBar`
- `FilterControls`
- `AuthGate`
- `LoadingState`
- `EmptyState`
- `ErrorMessage`
- `ImageWithFallback`

## Project implementation phases

### Phase 1: Foundation

- [x] Confirm the Next.js project structure.
- [x] Read the installed Next.js guidance in `node_modules/next/dist/docs/`.
- [x] Remove or replace MealMate-specific UI and data references if the existing project is being reused.
- [x] Configure Supabase environment variables.
- [x] Create the shared layout and navigation.
- [x] Establish the visual design system.

### Phase 2: Database and authentication

- [x] Create the Supabase schema.
- [x] Add Row Level Security policies.
- [x] Add profile creation behavior after sign-up.
- [x] Build sign-up, log-in, and log-out.
- [x] Verify session persistence.

### Phase 3: Public fry catalog

- [x] Add seed restaurants and fries.
- [x] Build the home page.
- [x] Build the browse page.
- [x] Build search, filters, and sorting.
- [x] Build restaurant and fry detail pages.
- [x] Add image fallback behavior.

### Phase 4: Ratings and comments

- [x] Build the rating form.
- [x] Build the score calculation and display.
- [x] Build the comment list and form.
- [x] Add edit and delete actions.
- [x] Add authentication gates.
- [x] Add validation and error handling.

### Phase 5: Responsive polish and testing

- [x] Test desktop and responsive layouts.
- [x] Test signed-out browsing behavior.
- [x] Test the available sign-up, log-in, and log-out flows.
- [x] Verify ownership checks and RLS policies.
- [x] Test refresh and persistence.
- [x] Test broken image behavior in the UI implementation.
- [x] Run the production build.
- [ ] Deploy the prototype after selecting a hosting provider.

## Manually built feature

At least one feature will be built manually to strengthen framework knowledge. The selected feature is the rating experience:

- The star-rating input will be manually implemented.
- The form state and validation will be manually implemented.
- The rating submission behavior will be manually connected to Supabase.
- The average-score update behavior will be manually tested and documented.

AI may be used for explanations, debugging, and review, but the implementation decisions and final behavior will be understood and tested by the developer.

## Validation and error handling checklist

- [x] Invalid email addresses show a clear error.
- [x] Password requirements are explained.
- [x] Incorrect login credentials show a useful message.
- [x] Empty comments cannot be submitted.
- [x] Overly long comments are rejected.
- [x] Ratings outside 1–5 are rejected.
- [x] Duplicate ratings are handled as edits instead of duplicate rows.
- [x] Unauthorized write attempts are rejected by both the UI and database policies.
- [x] Failed database requests show a recoverable error state.
- [x] Empty search results show an informative message.
- [x] Broken images use a fallback component.

## Testing checklist

1. Open the site while signed out.
2. Confirm that public fry data is visible.
3. Search and filter the fry catalog.
4. Open a restaurant page and a fry detail page.
5. Try to rate a fry while signed out and confirm the authentication prompt appears.
6. Create an account.
7. Log out and log back in.
8. Submit a rating.
9. Edit the rating.
10. Delete the rating.
11. Submit a comment.
12. Edit and delete the comment.
13. Confirm another user cannot edit or delete that content.
14. Refresh the page and confirm data persists.
15. Test the application at mobile width.
16. Test a broken or missing image.
17. Run the production build.

## Environment variables

Create a local `.env.local` file. Do not commit it.

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Add only if an external provider is selected.
IMAGE_PROVIDER_API_KEY=your-provider-key
```

The exact variable names may be adjusted to match the current Supabase client setup.

## Local development plan

Once the Next.js files are created:

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:3000
```

Before deployment:

```bash
npm run build
```

## Bakeoff reflection topics

The final project documentation should explain:

- Why Next.js and Supabase were selected.
- How the client-side rendering approach works.
- How authentication and Row Level Security were implemented.
- How the public and authenticated experiences differ.
- How fry images were sourced and attributed.
- Which feature was manually built.
- What was easy or difficult about the stack.
- What errors or limitations were encountered.
- What would be added with more time.
- Whether the chosen stack would be appropriate for a larger final project.

## Future features outside the MVP

These are intentionally postponed until the core prototype works:

- User profile avatars
- Favorite fries
- Restaurant maps
- Location-based recommendations
- Photo uploads
- Restaurant-owner accounts
- Moderation dashboard
- Comment likes
- Social following
- Advanced recommendation algorithms
- Automatic restaurant/menu API synchronization

The first milestone is a reliable, attractive, and testable fry-rating prototype—not a complete restaurant database.
