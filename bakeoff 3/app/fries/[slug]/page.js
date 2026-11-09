'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { fries as localFries } from '../../../lib/data/fries';
import FallbackImage from '../../../components/FallbackImage';

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
      setError(restaurantError?.code === 'PGRST116' ? 'We could not find that restaurant.' : 'This restaurant is temporarily unavailable. Please try again.');
      setLoading(false);
      return;
    }

    const fryData = restaurantData.fries?.[0];
    setRestaurant(restaurantData);
    setFry(fryData);

    if (fryData) {
      const [{ data: ratingData }, { data: commentData }] = await Promise.all([
        supabase.from('ratings').select('id, score, user_id, created_at').eq('fry_id', fryData.id).order('created_at', { ascending: false }),
        supabase.from('comments').select('id, body, user_id, created_at, updated_at').eq('fry_id', fryData.id).order('created_at', { ascending: false }),
      ]);
      setRatings(ratingData ?? []);
      setComments(commentData ?? []);
      const profileIds = [...new Set((commentData ?? []).map((item) => item.user_id).filter(Boolean))];
      if (profileIds.length) {
        const { data: profileData } = await supabase.from('profiles').select('id, display_name, username').in('id', profileIds);
        const names = Object.fromEntries((profileData ?? []).map((profile) => [profile.id, profile.display_name || profile.username || 'Fry fan']));
        setComments((commentData ?? []).map((item) => ({ ...item, authorName: names[item.user_id] || 'Fry fan' })));
      }
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
    if (saveError) setError('We could not save your rating. Please try again.');
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
    if (saveError) setError('We could not post your comment. Please try again.');
    else {
      setComment('');
      setMessage('Your comment was posted.');
    }
    await loadPage();
    setSaving(false);
  }

  async function editComment(item) {
    const nextBody = window.prompt('Edit your comment', item.body);
    if (nextBody === null || nextBody.trim() === item.body) return;
    if (nextBody.trim().length < 1 || nextBody.trim().length > 1000) {
      setError('Comments must be between 1 and 1000 characters.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.from('comments').update({ body: nextBody.trim() }).eq('id', item.id).eq('user_id', user.id);
    if (updateError) setError('We could not update your comment. Please try again.');
    else setMessage('Your comment was updated.');
    await loadPage();
    setSaving(false);
  }

  async function deleteComment(item) {
    if (!window.confirm('Delete your comment?')) return;
    setSaving(true);
    setError('');
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', item.id).eq('user_id', user.id);
    if (deleteError) setError('We could not delete your comment. Please try again.');
    else setMessage('Your comment was deleted.');
    await loadPage();
    setSaving(false);
  }

  async function deleteRating() {
    const ownRating = ratings.find((rating) => rating.user_id === user?.id);
    if (!ownRating || !window.confirm('Delete your rating?')) return;
    setSaving(true);
    setError('');
    const { error: deleteError } = await supabase.from('ratings').delete().eq('id', ownRating.id).eq('user_id', user.id);
    if (deleteError) setError('We could not delete your rating. Please try again.');
    else setMessage('Your rating was deleted.');
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
        <div className="detail-image-wrap"><FallbackImage className="detail-photo" src={imageUrl} alt={`${restaurant.name} fries`} /></div>
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
            {[1, 2, 3, 4, 5].map((value) => <button key={value} className={value <= score ? 'active' : ''} type="button" aria-label={`${value} star${value > 1 ? 's' : ''}`} aria-pressed={value === score} onClick={() => setScore(value)}>★</button>)}
          </div>
          <div className="rating-actions"><button className="button" type="button" onClick={saveRating} disabled={saving || score === 0}>{saving ? 'Saving…' : user ? 'Save my rating' : 'Log in to rate'}</button>{user && ratings.some((rating) => rating.user_id === user.id) && <button className="text-button danger-button" type="button" onClick={deleteRating} disabled={saving}>Delete rating</button>}</div>
        </div>

        <div className="comments-panel">
          <p className="eyebrow">Community comments</p>
          <h2>What fry fans are saying</h2>
          {comments.length === 0 && <p className="empty-state">No comments yet. Start the conversation.</p>}
          <div className="comments-list">{comments.map((item) => <article className="comment" key={item.id}><p>{item.body}</p><small>{item.authorName || 'Fry fan'} · {new Date(item.created_at).toLocaleDateString()}{item.updated_at !== item.created_at && ' · Edited'}</small>{user?.id === item.user_id && <div className="comment-actions"><button className="text-button" type="button" onClick={() => editComment(item)} disabled={saving}>Edit</button><button className="text-button danger-button" type="button" onClick={() => deleteComment(item)} disabled={saving}>Delete</button></div>}</article>)}</div>
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
