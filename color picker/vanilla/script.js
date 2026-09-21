const colors = Array.from({ length: 128 }, (_, index) => {
  const hue = Math.round((index / 128) * 360);
  const saturation = 72 + (index % 4) * 6;
  const lightness = 42 + Math.floor(index / 32) * 7;
  return { name: `Color ${String(index + 1).padStart(3, "0")}`, hex: hslToHex(hue, saturation, lightness) };
});

colors[0] = { name: "Royal Blue", hex: "#4169E1" };
const palette = document.querySelector("#palette");
const swatch = document.querySelector("#selected-swatch");
const selectedName = document.querySelector("#selected-name");
const selectedHex = document.querySelector("#selected-hex");
const copyButton = document.querySelector("#copy-button");
let selectedIndex = 0;

colors.forEach((color, index) => {
  const button = document.createElement("button");
  button.className = "color-button";
  button.type = "button";
  button.style.backgroundColor = color.hex;
  button.title = `${color.name} — ${color.hex}`;
  button.setAttribute("aria-label", button.title);
  button.setAttribute("role", "option");
  button.addEventListener("click", () => selectColor(index));
  palette.append(button);
});

function selectColor(index) {
  selectedIndex = index;
  const color = colors[index];
  swatch.style.backgroundColor = color.hex;
  selectedName.textContent = color.name;
  selectedHex.textContent = color.hex;
  document.querySelectorAll(".color-button").forEach((button, buttonIndex) => {
    button.classList.toggle("is-selected", buttonIndex === selectedIndex);
    button.setAttribute("aria-selected", buttonIndex === selectedIndex);
  });
}

copyButton.addEventListener("click", async () => {
  await navigator.clipboard?.writeText(colors[selectedIndex].hex);
  copyButton.textContent = "Copied!";
  setTimeout(() => { copyButton.textContent = "Copy hex"; }, 1200);
});

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)].map(value => Math.round(255 * value).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

selectColor(0);
