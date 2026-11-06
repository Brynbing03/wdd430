import AuthForm from '../../components/AuthForm';

export default function SignupPage() {
  return (
    <main className="auth-page">
      <a className="brand" href="/">
        <span className="brand-mark">F</span>
        <span>FryRank</span>
      </a>
      <section className="auth-card">
        <p className="eyebrow">Join the community</p>
        <h1>Create your fry profile.</h1>
        <p className="auth-copy">Create an account to rate fries and leave comments.</p>
        <AuthForm mode="signup" />
        <p className="auth-footer">Already have an account? <a href="/login">Log in</a></p>
      </section>
    </main>
  );
}
