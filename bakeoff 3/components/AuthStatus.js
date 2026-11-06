'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

export default function AuthStatus() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) return null;
  if (user) {
    return <div className="auth-nav"><a href="/profile">{user.user_metadata?.display_name || user.email?.split('@')[0]}</a><button className="button button-small button-outline" type="button" onClick={handleSignOut}>Log out</button></div>;
  }
  return <a className="button button-small" href="/login">Log in</a>;
}
