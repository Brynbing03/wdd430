// @ts-nocheck
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/client.js';

export const session = writable(null);
export const user = writable(null);
export const authReady = writable(!browser);
export const authError = writable('');

let initialized = false;

export async function initializeAuth() {
  if (!browser || initialized) return null;
  initialized = true;

  const { data, error } = await supabase.auth.getSession();
  if (error) authError.set(error.message);
  session.set(data.session);
  user.set(data.session?.user || null);
  authReady.set(true);

  supabase.auth.onAuthStateChange((_event, nextSession) => {
    session.set(nextSession);
    user.set(nextSession?.user || null);
  });

  return data.session;
}

export async function signIn(email, password) {
  authError.set('');
  const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (result.error) authError.set(result.error.message);
  return result;
}

export async function signUp(email, password) {
  authError.set('');
  const result = await supabase.auth.signUp({ email: email.trim(), password });
  if (result.error) authError.set(result.error.message);
  return result;
}

export async function signOut() {
  const result = await supabase.auth.signOut();
  if (result.error) authError.set(result.error.message);
  return result;
}
