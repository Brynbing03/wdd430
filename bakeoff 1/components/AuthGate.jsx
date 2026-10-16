"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

const emptyForm = { name: "", email: "", password: "", confirmPassword: "" };

function sessionForUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "MealMate user"
  };
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(sessionForUser(data.session?.user));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(sessionForUser(nextSession?.user));
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
    setNotice("");
  };

  const submit = async (event) => {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email || !email.includes("@")) return setError("Enter a valid email address.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (mode === "signup" && !form.name.trim()) return setError("Enter your name.");
    if (mode === "signup" && form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setError("");
    setNotice("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password: form.password })
      : await supabase.auth.signUp({ email, password: form.password, options: { data: { name: form.name.trim() } } });

    if (result.error) return setError(result.error.message.includes("Invalid login credentials") ? "Email or password is incorrect." : result.error.message);
    if (mode === "signup" && !result.data.session) {
      setNotice("Account created. Check your email to confirm your account, then log in.");
      setMode("login");
      setForm({ ...emptyForm, email });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setMode("login");
    setForm(emptyForm);
    setNotice("You have been logged out.");
  };

  if (session === undefined) return <div className="auth-loading" aria-label="Loading MealMate" />;
  if (session) return children(session, logout);
  return <AuthScreen mode={mode} form={form} error={error} notice={notice} onModeChange={(nextMode) => { setMode(nextMode); setError(""); setNotice(""); }} onUpdate={update} onSubmit={submit} />;
}

function AuthScreen({ mode, form, error, notice, onModeChange, onUpdate, onSubmit }) {
  const signup = mode === "signup";
  return <main className="auth-page"><section className="auth-card" aria-labelledby="auth-title"><div className="auth-brand"><span className="brand-mark">✦</span><span>meal<span>mate</span></span></div><p className="kicker">{signup ? "JOIN YOUR KITCHEN SPACE" : "WELCOME BACK"}</p><h1 id="auth-title">{signup ? "Create your account" : "Log in to MealMate"}</h1><p className="auth-description">{signup ? "Save recipes and plan meals anywhere." : "Pick up where you left off with your meal plan."}</p><form onSubmit={onSubmit} noValidate>{signup && <label htmlFor="auth-name">Name<input id="auth-name" value={form.name} onChange={(event) => onUpdate("name", event.target.value)} autoComplete="name" /></label>}<label htmlFor="auth-email">Email<input id="auth-email" type="email" value={form.email} onChange={(event) => onUpdate("email", event.target.value)} autoComplete="email" /></label><label htmlFor="auth-password">Password<input id="auth-password" type="password" value={form.password} onChange={(event) => onUpdate("password", event.target.value)} autoComplete={signup ? "new-password" : "current-password"} /></label>{signup && <label htmlFor="auth-confirm-password">Confirm password<input id="auth-confirm-password" type="password" value={form.confirmPassword} onChange={(event) => onUpdate("confirmPassword", event.target.value)} autoComplete="new-password" /></label>}{error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}<button className="primary-button auth-submit" type="submit">{signup ? "Create account" : "Log in"}</button></form><button className="auth-switch" onClick={() => onModeChange(signup ? "login" : "signup")}>{signup ? "Already have an account? Log in" : "Need an account? Sign up"}</button><p className="auth-local-note">Your account is securely stored with Supabase.</p></section></main>;
}

