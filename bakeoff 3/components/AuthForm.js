'use client';

import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

export default function AuthForm({ mode = 'login' }) {
  const isSignup = mode === 'signup';
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    const result = isSignup
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName.trim() || email.split('@')[0] } } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
      return;
    }
    if (isSignup && !result.data.session) {
      setMessage('Account created. You can log in now.');
    } else {
      window.location.href = '/';
    }
    setSubmitting(false);
  }

  return <form onSubmit={handleSubmit}>
    {isSignup && <><label htmlFor="display-name">Display name</label><input id="display-name" type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Fry fan" /></>}
    <label htmlFor="email">Email address</label>
    <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
    <label htmlFor="password">Password</label>
    <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="At least 6 characters" />
    <button className="button" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}</button>
    {error && <p className="form-error" role="alert">{error}</p>}
    {message && <p className="form-message" role="status">{message}</p>}
  </form>;
}
