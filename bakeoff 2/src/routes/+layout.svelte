<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authReady, initializeAuth, session } from '$lib/auth.js';
  import { initializePersistence, hydrationReady } from '$lib/tournament.js';
  import '../app.css';

  onMount(async () => {
    const currentSession = await initializeAuth();
    await initializePersistence(currentSession?.user?.id || null);
    if (!currentSession && window.location.pathname !== '/login') goto('/login');
    if (currentSession && window.location.pathname === '/login') goto('/');
  });
</script>

<svelte:head>
  <title>PicklePlay — Tournament tracker</title>
  <meta name="description" content="A colorful pickleball tournament tracker for every doubles division." />
</svelte:head>

{#if $authReady && (($session && $hydrationReady) || $page.url.pathname === '/login')}
  <slot />
{:else}
  <main class="loading-shell" aria-live="polite"><div class="loading-mark">✦</div><p class="eyebrow">PICKLEPLAY</p><h1>Loading the court...</h1><p>Checking your account.</p></main>
{/if}
