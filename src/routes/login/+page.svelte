<script>
  import { goto } from '$app/navigation';
  import { authError, signIn, signUp } from '$lib/auth.js';

  let mode = 'signin';
  let email = '';
  let password = '';
  let busy = false;
  let message = '';

  async function submit() {
    busy = true;
    message = '';
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    busy = false;
    if (result.error) return;
    if (mode === 'signup' && !result.data.session) {
      message = 'Account created. Check your email to confirm your account, then sign in.';
      mode = 'signin';
      return;
    }
    await goto('/');
  }
</script>

<svelte:head>
  <title>{mode === 'signin' ? 'Sign in' : 'Create account'} · PicklePlay</title>
</svelte:head>

<main class="auth-page">
  <section class="auth-card" aria-labelledby="auth-title">
    <a class="auth-brand" href="/"><img src="/pickleplay-logo.png" alt="" /><span>pickle<span class="brand-accent">play</span></span></a>
    <p class="eyebrow">TOURNAMENT TRACKER</p>
    <h1 id="auth-title">{mode === 'signin' ? 'Welcome back.' : 'Join PicklePlay.'}</h1>
    <p class="auth-copy">{mode === 'signin' ? 'Sign in to access your tournaments and standings.' : 'Create an account to save your tournaments securely.'}</p>
    <form on:submit|preventDefault={submit}>
      <label>Email<input type="email" bind:value={email} autocomplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input type="password" bind:value={password} autocomplete={mode === 'signin' ? 'current-password' : 'new-password'} minlength="6" required placeholder="At least 6 characters" /></label>
      {#if $authError}<p class="auth-error" role="alert">{$authError}</p>{/if}
      {#if message}<p class="auth-message" role="status">{message}</p>{/if}
      <button class="primary-button" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
    </form>
    <button class="auth-switch" on:click={() => { mode = mode === 'signin' ? 'signup' : 'signin'; message = ''; }}>
      {mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
    </button>
  </section>
</main>
