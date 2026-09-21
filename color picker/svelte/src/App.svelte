<script>
  const colors = Array.from({ length: 128 }, (_, i) => ({ name: `Color ${String(i + 1).padStart(3, "0")}`, hex: hslToHex(Math.round((i / 128) * 360), 72 + (i % 4) * 6, 42 + Math.floor(i / 32) * 7) }));
  colors[0] = { name: "Royal Blue", hex: "#4169E1" };
  let selected = colors[0];
  let copied = false;
  function hslToHex(h, s, l) { s /= 100; l /= 100; const k = n => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return `#${[f(0), f(8), f(4)].map(v => Math.round(255 * v).toString(16).padStart(2, "0")).join("").toUpperCase()}`; }
  async function copyHex() { await navigator.clipboard?.writeText(selected.hex); copied = true; setTimeout(() => copied = false, 1200); }
</script>

<main class="picker-shell"><section class="picker-card" aria-labelledby="title">
  <p class="eyebrow">Svelte</p><h1 id="title">Find your color</h1><p class="intro">Choose a shade from the 128-color palette.</p>
  <div class="selection" aria-live="polite"><div class="swatch" style={`background:${selected.hex}`}></div><div><span class="selection-label">Selected color</span><strong>{selected.name}</strong><code>{selected.hex}</code></div><button class="copy-button" on:click={copyHex}>{copied ? "Copied!" : "Copy hex"}</button></div>
  <div class="palette" role="listbox" aria-label="128 colors">{#each colors as color}<button class:is-selected={selected === color} class="color-button" style={`background:${color.hex}`} title={`${color.name} — ${color.hex}`} aria-label={`${color.name} — ${color.hex}`} aria-selected={selected === color} on:click={() => selected = color}></button>{/each}</div>
  <p class="count">128 colors · 16 columns × 8 rows</p>
</section></main>
