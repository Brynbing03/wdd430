<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { signOut } from '$lib/auth.js';
  import { profile, updateProfile, divisions } from '$lib/tournament.js';
  let showProfile = false;
  let profileDraft = { organizer: '', email: '', defaultDivision: 'girls', defaultCourts: 2 };

  function openProfile() {
    profileDraft = { ...$profile };
    showProfile = true;
  }

  function saveProfile() {
    if (updateProfile(profileDraft)) showProfile = false;
  }

  async function logOut() {
    await signOut();
    await goto('/login');
  }

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === 'Escape' && showProfile) showProfile = false;
  }

  $: initials = ($profile.organizer || 'JS').split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase();
</script>

<svelte:window on:keydown={handleKeydown} />

<header class="topbar">
  <a class="brand" href="/" aria-label="PicklePlay home"><img class="brand-mark" src="/pickleplay-logo.png" alt="" /><span>pickle<span class="brand-accent">play</span></span></a>
  <nav aria-label="Main navigation">
    <a class:nav-active={$page?.url?.pathname === '/'} href="/">Dashboard</a>
    <a class:nav-active={$page?.url?.pathname === '/bracket'} href="/bracket">Bracket</a>
    <a class:nav-active={$page?.url?.pathname === '/teams'} href="/teams">Teams</a>
  </nav>
  <button class="profile-button" aria-label="Open profile" on:click={openProfile}><span class="avatar">{initials}</span><span>{$profile.organizer}</span><span class="chevron">⌄</span></button>
</header>

{#if showProfile}
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="profile-title" tabindex="-1" on:click={(event) => event.target === event.currentTarget && (showProfile = false)} on:keydown={(event) => event.key === 'Escape' && (showProfile = false)}>
    <form class="modal" on:submit|preventDefault={saveProfile}>
      <button type="button" class="modal-close" aria-label="Close profile" on:click={() => showProfile = false}>×</button>
      <p class="eyebrow">ORGANIZER PROFILE</p>
      <h2 id="profile-title">Profile &amp; preferences</h2>
      <label>Organizer name<input bind:value={profileDraft.organizer} placeholder="Jordan Smith" /></label>
      <label>Email <span class="optional">(optional)</span><input type="email" bind:value={profileDraft.email} placeholder="you@example.com" /></label>
      <div class="player-fields">
        <label>Preferred division<select bind:value={profileDraft.defaultDivision}>{#each divisions as division}<option value={division.id}>{division.label}</option>{/each}</select></label>
        <label>Default courts<input type="number" min="1" step="1" bind:value={profileDraft.defaultCourts} /></label>
      </div>
      <button class="primary-button" type="submit">Save profile</button>
      <button class="auth-switch" type="button" on:click={logOut}>Log out</button>
    </form>
  </div>
{/if}
