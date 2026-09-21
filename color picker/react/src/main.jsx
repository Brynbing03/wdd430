import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const hslToHex = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return `#${[f(0), f(8), f(4)].map(v => Math.round(255 * v).toString(16).padStart(2, "0")).join("").toUpperCase()}`; };
const colors = Array.from({ length: 128 }, (_, i) => ({ name: `Color ${String(i + 1).padStart(3, "0")}`, hex: hslToHex(Math.round((i / 128) * 360), 72 + (i % 4) * 6, 42 + Math.floor(i / 32) * 7) }));
colors[0] = { name: "Royal Blue", hex: "#4169E1" };

function App() {
  const [selected, setSelected] = useState(colors[0]);
  const [copied, setCopied] = useState(false);
  const copyHex = async () => { await navigator.clipboard?.writeText(selected.hex); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  return <main className="picker-shell"><section className="picker-card" aria-labelledby="title">
    <p className="eyebrow">React</p><h1 id="title">Find your color</h1><p className="intro">Choose a shade from the 128-color palette.</p>
    <div className="selection" aria-live="polite"><div className="swatch" style={{ backgroundColor: selected.hex }} /><div><span className="selection-label">Selected color</span><strong>{selected.name}</strong><code>{selected.hex}</code></div><button className="copy-button" onClick={copyHex}>{copied ? "Copied!" : "Copy hex"}</button></div>
    <div className="palette" role="listbox" aria-label="128 colors">{colors.map(color => <button key={color.hex} className={`color-button ${selected === color ? "is-selected" : ""}`} style={{ backgroundColor: color.hex }} title={`${color.name} — ${color.hex}`} aria-label={`${color.name} — ${color.hex}`} aria-selected={selected === color} onClick={() => setSelected(color)} />)}</div>
    <p className="count">128 colors · 16 columns × 8 rows</p>
  </section></main>;
}

createRoot(document.getElementById("root")).render(<App />);
