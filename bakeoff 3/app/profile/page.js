'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingBody, setEditingBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadProfile(currentUser) {
    const [{ data: profileData, error: profileError }, { data: ratingData, error: ratingError }, { data: commentData, error: commentError }] = await Promise.all([
      supabase.from('profiles').select('id, username, display_name, avatar_url').eq('id', currentUser.id).maybeSingle(),
      supabase.from('ratings').select('id, score, created_at, fry_id, fries(name, slug)').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
      supabase.from('comments').select('id, body, created_at, updated_at, fry_id, fries(name, slug)').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
    ]);

    if (profileError || ratingError || commentError) {
      setError('We could not load your profile activity. Please refresh and try again.');
      return;
    }

    const nextProfile = profileData || { id: currentUser.id, display_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || 'Fry fan' };
    setProfile(nextProfile);
    setDisplayName(nextProfile.display_name || nextProfile.username || currentUser.email?.split('@')[0] || 'Fry fan');
    setRatings(ratingData || []);
    setComments(commentData || []);
  }

  useEffect(() => {
    let active = true;
    async function initialize() {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!active) return;
      if (userError || !data.user) {
        router.replace('/login');
        return;
      }
      setUser(data.user);
      await loadProfile(data.user);
      if (active) setLoading(false);
    }
    initialize();
    return () => { active = false; };
    // The client is stable for this page and the profile should load once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function clearFeedback() {
    setMessage('');
    setError('');
  }

  async function saveDisplayName(event) {
    event.preventDefault();
    clearFeedback();
    const nextName = displayName.trim();
    if (!nextName || nextName.length > 60) {
      setError('Display names must be between 1 and 60 characters.');
      return;
    }
    setSaving(true);
    const { data, error: saveError } = await supabase.from('profiles').upsert({ id: user.id, display_name: nextName }, { onConflict: 'id' }).select('id, username, display_name, avatar_url').single();
    if (saveError) setError(saveError.message);
    else {
      setProfile(data);
      setDisplayName(data.display_name || nextName);
      setMessage('Your display name was updated.');
    }
    setSaving(false);
  }

  async function deleteRating(ratingId) {
    if (!window.confirm('Delete this rating?')) return;
    clearFeedback();
    setSaving(true);
    const { error: deleteError } = await supabase.from('ratings').delete().eq('id', ratingId).eq('user_id', user.id);
    if (deleteError) setError(deleteError.message);
    else {
      setRatings((current) => current.filter((rating) => rating.id !== ratingId));
      setMessage('Rating deleted.');
    }
    setSaving(false);
  }

  function beginCommentEdit(item) {
    clearFeedback();
    setEditingComment(item.id);
    setEditingBody(item.body);
  }

  async function saveComment(event, commentId) {
    event.preventDefault();
    const body = editingBody.trim();
    if (body.length < 1 || body.length > 1000) {
      setError('Comments must be between 1 and 1000 characters.');
      return;
    }
    clearFeedback();
    setSaving(true);
    const { data, error: saveError } = await supabase.from('comments').update({ body }).eq('id', commentId).eq('user_id', user.id).select('id, body, created_at, updated_at, fry_id, fries(name, slug)').single();
    if (saveError) setError(saveError.message);
    else {
      setComments((current) => current.map((comment) => comment.id === commentId ? data : comment));
      setEditingComment(null);
      setEditingBody('');
      setMessage('Comment updated.');
    }
    setSaving(false);
  }

  async function deleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return;
    clearFeedback();
    setSaving(true);
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
    if (deleteError) setError(deleteError.message);
    else {
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      setMessage('Comment deleted.');
    }
    setSaving(false);
  }

  if (loading) return <main className="profile-page"><p className="detail-status">Loading your profile…</p></main>;
  if (!user) return null;

  const name = profile?.display_name || user.email?.split('@')[0] || 'Fry fan';
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <main className="profile-page">
      <a className="back-link" href="/">← Back to FryRank</a>
      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">{initials}</div>
        <div>
          <p className="eyebrow">Your FryRank account</p>
          <h1>{name}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </header>

      <section className="profile-settings" aria-labelledby="profile-settings-title">
        <div>
          <p className="eyebrow">Profile settings</p>
          <h2 id="profile-settings-title">How should your name appear?</h2>
        </div>
        <form className="profile-name-form" onSubmit={saveDisplayName}>
          <label htmlFor="profile-display-name">Display name</label>
          <div className="profile-name-controls">
            <input id="profile-display-name" value={displayName} onChange={(event) => { setDisplayName(event.target.value); clearFeedback(); }} maxLength={60} required />
            <button className="button" type="submit" disabled={saving}>Save name</button>
          </div>
        </form>
      </section>

      {message && <p className="form-message" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="profile-section" aria-labelledby="ratings-title">
        <div className="profile-section-heading"><div><p className="eyebrow">Your activity</p><h2 id="ratings-title">Your ratings</h2></div><span>{ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}</span></div>
        {ratings.length === 0 ? <p className="profile-empty">You have not rated any fries yet. <a href="/#browse">Browse the rankings →</a></p> : <div className="profile-list">{ratings.map((rating) => <article className="profile-item" key={rating.id}><div><a className="profile-item-title" href={`/fries/${rating.fries?.slug || ''}`}>{rating.fries?.name || 'Fries'}</a><p className="profile-item-meta"><span className="stars" aria-label={`${rating.score} out of 5 stars`}>{'★'.repeat(rating.score)}<span className="empty-stars">{'★'.repeat(5 - rating.score)}</span></span> · {new Date(rating.created_at).toLocaleDateString()}</p></div><button className="text-button danger-button" type="button" onClick={() => deleteRating(rating.id)} disabled={saving}>Delete</button></article>)}</div>}
      </section>

      <section className="profile-section" aria-labelledby="comments-title">
        <div className="profile-section-heading"><div><p className="eyebrow">Your words</p><h2 id="comments-title">Your comments</h2></div><span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span></div>
        {comments.length === 0 ? <p className="profile-empty">You have not shared a fry opinion yet. <a href="/#browse">Find a fry to review →</a></p> : <div className="profile-list">{comments.map((item) => <article className="profile-item comment-profile-item" key={item.id}>{editingComment === item.id ? <form className="edit-comment-form" onSubmit={(event) => saveComment(event, item.id)}><label htmlFor={`edit-comment-${item.id}`}>Edit your comment</label><textarea id={`edit-comment-${item.id}`} value={editingBody} onChange={(event) => setEditingBody(event.target.value)} maxLength={1000} autoFocus /><div className="item-actions"><button className="button button-small" type="submit" disabled={saving}>Save changes</button><button className="text-button" type="button" onClick={() => setEditingComment(null)}>Cancel</button></div></form> : <><div><a className="profile-item-title" href={`/fries/${item.fries?.slug || ''}`}>{item.fries?.name || 'Fries'}</a><p className="profile-comment-body">{item.body}</p><p className="profile-item-meta">Posted {new Date(item.created_at).toLocaleDateString()}{item.updated_at !== item.created_at && ' · Edited'}</p></div><div className="item-actions"><button className="text-button" type="button" onClick={() => beginCommentEdit(item)} disabled={saving}>Edit</button><button className="text-button danger-button" type="button" onClick={() => deleteComment(item.id)} disabled={saving}>Delete</button></div></>}</article>)}</div>}
      </section>
    </main>
  );
}
