'use client';

import AuthForm from '../../components/AuthForm';

export default function LoginPage() {
  return (
    <main className="auth-page">
      <a className="brand" href="/">
        <span className="brand-mark">F</span>
        <span>FryRank</span>
      </a>
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to rate fries.</h1>
        <p className="auth-copy">Log in to rate your favorite fries and join the conversation.</p>
        <AuthForm mode="login" />
        <p className="auth-footer">New to FryRank? <a href="/signup">Create an account</a></p>
      </section>
    </main>
  );
}
