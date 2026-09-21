import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Color = { name: string; hex: string };

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)].map(v => Math.round(255 * v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

@Component({ selector: 'app-root', standalone: true, imports: [CommonModule], templateUrl: './app.component.html' })
export class AppComponent {
  colors: Color[] = Array.from({ length: 128 }, (_, i) => ({ name: `Color ${String(i + 1).padStart(3, '0')}`, hex: hslToHex(Math.round((i / 128) * 360), 72 + (i % 4) * 6, 42 + Math.floor(i / 32) * 7) }));
  selected: Color;
  copied = false;
  constructor() { this.colors[0] = { name: 'Royal Blue', hex: '#4169E1' }; this.selected = this.colors[0]; }
  select(color: Color) { this.selected = color; }
  async copyHex() { await navigator.clipboard?.writeText(this.selected.hex); this.copied = true; setTimeout(() => this.copied = false, 1200); }
}
