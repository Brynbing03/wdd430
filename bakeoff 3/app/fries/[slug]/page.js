'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { fries as localFries } from '../../../lib/data/fries';

export default function FryDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [fry, setFry] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = useMemo(() => createClient(), []);
  const localFry = localFries.find((item) => {
    const localSlug = item.restaurant.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return localSlug === slug || item.restaurant === slug;
  });

  async function loadPage() {
    if (!slug) return;
    setLoading(true);
    const { data: currentUser } = await supabase.auth.getUser();
    setUser(currentUser.user ?? null);

    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, slug, description, fries(id, name, slug, style, image_url)')
      .eq('slug', slug)
      .single();

    if (restaurantError || !restaurantData) {
      setError('We could not find that restaurant.');
      setLoading(false);
      return;
    }

    const fryData = restaurantData.fries?.[0];
    setRestaurant(restaurantData);
    setFry(fryData);

    if (fryData) {
      const [{ data: ratingData }, { data: commentData }] = await Promise.all([
        supabase.from('ratings').select('id, score, user_id, created_at').eq('fry_id', fryData.id).order('created_at', { ascending: false }),
        supabase.from('comments').select('id, body, user_id, created_at').eq('fry_id', fryData.id).order('created_at', { ascending: false }),
      ]);
      setRatings(ratingData ?? []);
      setComments(commentData ?? []);
      const ownRating = (ratingData ?? []).find((rating) => rating.user_id === currentUser.user?.id);
      setScore(ownRating?.score ?? 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPage();
    // Auth state is intentionally read again when the page is revisited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function requireUser() {
    if (user) return true;
    router.push('/login');
    return false;
  }

  async function saveRating() {
    if (!(await requireUser()) || !fry || score === 0) return;
    setSaving(true);
    setError('');
    const { error: saveError } = await supabase.from('ratings').upsert({ fry_id: fry.id, user_id: user.id, score }, { onConflict: 'fry_id,user_id' });
    if (saveError) setError(saveError.message);
    else setMessage('Your rating was saved.');
    await loadPage();
    setSaving(false);
  }

  async function saveComment(event) {
    event.preventDefault();
    if (!(await requireUser()) || !fry) return;
    if (comment.trim().length < 1 || comment.trim().length > 1000) {
      setError('Comments must be between 1 and 1000 characters.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: saveError } = await supabase.from('comments').insert({ fry_id: fry.id, user_id: user.id, body: comment.trim() });
    if (saveError) setError(saveError.message);
    else {
      setComment('');
      setMessage('Your comment was posted.');
    }
    await loadPage();
    setSaving(false);
  }

  if (loading) return <main className="detail-page"><p className="detail-status">Loading restaurant…</p></main>;
  if (error && !restaurant) return <main className="detail-page"><p className="detail-status form-error">{error}</p><a className="text-button" href="/">← Back to rankings</a></main>;

  const average = ratings.length ? (ratings.reduce((total, rating) => total + rating.score, 0) / ratings.length).toFixed(1) : '—';
  const imageUrl = fry?.image_url || localFry?.imageUrl;

  return (
    <main className="detail-page">
      <a className="back-link" href="/">← Back to FryRank</a>
      <section className="detail-hero">
        <div className="detail-image-wrap"><img src={imageUrl} alt={`${restaurant.name} fries`} /></div>
        <div className="detail-intro">
          <p className="eyebrow">Fast-food restaurant</p>
          <h1>{restaurant.name}</h1>
          <p className="detail-fry-name">{fry?.name || 'Fries'}</p>
          <div className="rating-summary"><strong>★ {average}</strong><span>{ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}</span></div>
          <p className="detail-description">{restaurant.description || `Share your honest take on ${restaurant.name}'s fries with the FryRank community.`}</p>
        </div>
      </section>

      <section className="detail-content">
        <div className="rating-panel">
          <p className="eyebrow">Your take</p>
          <h2>How do these fries rank?</h2>
          <div className="star-picker" aria-label="Choose a rating from 1 to 5">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} className={value <= score ? 'active' : ''} type="button" aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => setScore(value)}>★</button>)}
          </div>
          <button className="button" type="button" onClick={saveRating} disabled={saving || score === 0}>{saving ? 'Saving…' : user ? 'Save my rating' : 'Log in to rate'}</button>
        </div>

        <div className="comments-panel">
          <p className="eyebrow">Community comments</p>
          <h2>What fry fans are saying</h2>
          {comments.length === 0 && <p className="empty-state">No comments yet. Start the conversation.</p>}
          <div className="comments-list">{comments.map((item) => <article className="comment" key={item.id}><p>{item.body}</p><small>Fry fan · {new Date(item.created_at).toLocaleDateString()}</small></article>)}</div>
          <form className="comment-form" onSubmit={saveComment}>
            <label htmlFor="comment">Leave a comment</label>
            <textarea id="comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder={user ? 'Tell us what you think…' : 'Log in to join the conversation'} disabled={!user || saving} maxLength={1000} />
            <button className="button" type="submit" disabled={!user || saving}>{user ? 'Post comment' : 'Log in to comment'}</button>
          </form>
        </div>
      </section>
      {message && <p className="form-message detail-message" role="status">{message}</p>}
      {error && restaurant && <p className="form-error detail-message" role="alert">{error}</p>}
    </main>
  );
}
