import './playground.css';

const T = {
  eyebrow: 'New · Skincare',
  hero: 'Glow that’s <em class="text-brand-text">truly</em> yours',
  title: 'Bestsellers in Skincare',
  name: 'Rose Glow Vitamin C Serum, 30 ml',
  off: '19% off',
  ratings: '2,341 ratings',
  desc: 'Lightweight serum with 10% vitamin C and rose extract. Brightens dull skin in 4 weeks. Dermatologically tested, for all skin types.',
  cta: 'Add to Bag',
  line: 'Beauty that feels like you',
};

const WEIGHTS = [
  [300, 'font-light'],
  [400, 'font-normal'],
  [500, 'font-medium'],
  [600, 'font-semibold'],
  [700, 'font-bold'],
];
const SIZES = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
];

function renderType() {
  const t = T;
  document.getElementById('type').innerHTML = `
    <article class="bg-surface rounded-2xl border p-6">
      <p class="text-brand-text text-xs font-semibold uppercase tracking-widest">${t.eyebrow}</p>
      <p class="font-display mt-2 text-5xl font-medium leading-tight">${t.hero}</p>
      <p class="font-display mt-4 text-3xl font-medium">${t.title}</p>
      <p class="text-foreground-muted mt-6 text-xs font-semibold">font-display · Fraunces</p>
      <div class="font-display mt-2 flex flex-wrap gap-x-4 text-2xl">
        ${WEIGHTS.map(([w, c]) => `<span class="${c}">${w}</span>`).join('')}<span class="italic">Italic</span>
      </div>
    </article>
    <article class="bg-surface rounded-2xl border p-6">
      <p class="text-foreground-muted text-xs font-bold tracking-wider">BEAUTINIQUE</p>
      <p class="mt-1 font-medium">${t.name}</p>
      <p class="mt-2 flex items-baseline gap-2 tabular-nums">
        <span class="text-lg font-bold">₹1,299</span>
        <s class="text-foreground-subtle">₹1,599</s>
        <span class="text-price-discount font-semibold">${t.off}</span>
      </p>
      <p class="text-foreground-muted text-sm"><span class="text-rating">★</span> 4.6 · ${t.ratings}</p>
      <p class="mt-3">${t.desc}</p>
      <button type="button" class="bg-brand text-brand-foreground hover:bg-brand-hover mt-4 rounded-lg px-5 py-2.5 font-semibold">${t.cta}</button>
      <p class="text-foreground-muted mt-6 text-xs font-semibold">font-sans · Plus Jakarta Sans</p>
      <div class="mt-2 flex flex-wrap gap-x-4 text-lg">
        ${WEIGHTS.map(([w, c]) => `<span class="${c}">${w} ₹1,299</span>`).join('')}<span class="italic">${t.line}</span>
      </div>
    </article>`;
  document.getElementById('sizes').innerHTML = SIZES.map(
    (s) =>
      `<div class="flex flex-col gap-1 py-2 sm:flex-row sm:items-baseline sm:gap-4"><code class="text-foreground-subtle w-20 shrink-0 text-xs">${s}</code><p class="${s} min-w-0 max-w-3xl">${t.desc}</p></div>`,
  ).join('');
}

renderType();

document.getElementById('toggle').addEventListener('click', () => {
  const html = document.documentElement;
  html.setAttribute('theme', html.getAttribute('theme') === 'dark' ? 'light' : 'dark');
});
document
  .getElementById('open-dialog')
  .addEventListener('click', () => document.getElementById('dialog').showModal());

document.getElementById('contrast').addEventListener('click', (event) => {
  const html = document.documentElement;
  const more = html.getAttribute('contrast') !== 'more';
  html.setAttribute('contrast', more ? 'more' : 'normal');
  event.currentTarget.setAttribute('aria-pressed', String(more));
});

// Full class names: Tailwind only builds classes it can read whole in the source (never `tone-${t}`).
const TONES = {
  brand: 'tone-brand',
  secondary: 'tone-secondary',
  accent: 'tone-accent',
  success: 'tone-success',
  warning: 'tone-warning',
  error: 'tone-error',
  info: 'tone-info',
  neutral: 'tone-neutral',
};
document.getElementById('tones').innerHTML = Object.entries(TONES)
  .map(
    ([name, tone]) =>
      `<span class="${tone} inline-flex overflow-hidden rounded-full text-sm font-medium"><span class="bg-tone text-tone-foreground px-3 py-1">${name}</span><span class="bg-tone-subtle text-tone-subtle-foreground px-3 py-1">subtle</span></span>`,
  )
  .join('');

const STATUSES = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'ALLOCATED',
  'PICKED',
  'PACKED',
  'DISPATCHED',
  'AT_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RTO',
  'RETURN_REQUESTED',
  'RETURNED',
];
document.getElementById('statuses').innerHTML = STATUSES.map(
  (s) =>
    `<span data-order-status="${s}" class="bg-tone-subtle text-tone-subtle-foreground rounded-full px-3 py-1 text-xs font-semibold">${s
      .toLowerCase()
      .replaceAll('_', ' ')}</span>`,
).join('');

const CHARTS = [
  ['bg-chart-1', 62],
  ['bg-chart-2', 88],
  ['bg-chart-3', 45],
  ['bg-chart-4', 70],
  ['bg-chart-5', 53],
  ['bg-chart-6', 95],
  ['bg-chart-7', 38],
  ['bg-chart-8', 76],
];
document.getElementById('charts').innerHTML = CHARTS.map(
  ([bg, h]) =>
    `<div class="flex flex-1 flex-col items-center gap-1"><div class="${bg} w-full rounded-t-md" style="height:${h}px"></div><span class="text-foreground-muted text-xs">${bg.slice(3)}</span></div>`,
).join('');

const ANIMATIONS = [
  'fade-in',
  'scale-in',
  'rise-in',
  'slide-in-from-left',
  'slide-in-from-bottom',
  'shake',
  'pop',
  'fade-out',
  'scale-out',
  'sink-out',
  'slide-out-to-right',
];
// Tailwind sees these full class names here, so their keyframes are built.
const ANIMATION_CLASSES = {
  'fade-in': 'animate-fade-in',
  'scale-in': 'animate-scale-in',
  'rise-in': 'animate-rise-in',
  'slide-in-from-left': 'animate-slide-in-from-left',
  'slide-in-from-bottom': 'animate-slide-in-from-bottom',
  shake: 'animate-shake',
  pop: 'animate-pop',
  'fade-out': 'animate-fade-out',
  'scale-out': 'animate-scale-out',
  'sink-out': 'animate-sink-out',
  'slide-out-to-right': 'animate-slide-out-to-right',
};
const box = document.getElementById('anim-box');
document.getElementById('anim-buttons').innerHTML = ANIMATIONS.map(
  (a) =>
    `<button type="button" data-animation="${a}" class="rounded-lg border px-3 py-1.5 text-sm">${a}</button>`,
).join('');
document.getElementById('anim-buttons').addEventListener('click', (event) => {
  const name = event.target.closest('button')?.dataset.animation;
  if (!name) return;
  box.className = box.className.replace(/\banimate-\S+/g, '').trim();
  void box.offsetWidth; // restart the animation
  box.classList.add(ANIMATION_CLASSES[name]);
});

const offers = [
  'Free delivery above ₹499',
  'New: Rose Glow serum',
  'Try shades on with your camera',
];
document.getElementById('marquee').innerHTML = [...offers, ...offers]
  .map((o) => `<span class="shrink-0">${o}</span>`)
  .join('');

document.getElementById('heart').addEventListener('click', (event) => {
  const heart = event.currentTarget;
  heart.classList.remove('animate-pop');
  void heart.offsetWidth;
  heart.classList.add('animate-pop');
});

// What the Quill 2 editor saves (lists are <ol> with data-list, markers in .ql-ui).
document.getElementById('rich').innerHTML = `
  <h2>Rose Glow Vitamin C Serum</h2>
  <p>Lightweight serum with <strong>10% vitamin C</strong> and rose extract. <a href="#rich">Read the full ingredient list</a>.</p>
  <h3>How to use</h3>
  <ol>
    <li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Cleanse your face.</li>
    <li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Apply 3–4 drops:</li>
    <li data-list="ordered" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>morning, under sunscreen</li>
    <li data-list="ordered" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>night, before moisturiser</li>
    <li data-list="ordered" class="ql-indent-2"><span class="ql-ui" contenteditable="false"></span>skip on peeling nights</li>
    <li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Pat gently.</li>
  </ol>
  <h3>Good for</h3>
  <ol>
    <li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Dull skin</li>
    <li data-list="bullet" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>uneven tone</li>
    <li data-list="checked"><span class="ql-ui" contenteditable="false"></span>Dermatologically tested</li>
    <li data-list="unchecked"><span class="ql-ui" contenteditable="false"></span>Fragrance free</li>
  </ol>
  <p class="ql-align-center"><span class="ql-size-small">Patch test before first use.</span></p>
  <blockquote>My skin looks brighter after three weeks. (verified purchase)</blockquote>
  <table><thead><tr><th>Size</th><th>MRP</th></tr></thead><tbody><tr><td>30 ml</td><td>₹1,599</td></tr><tr><td>50 ml</td><td>₹2,299</td></tr></tbody></table>
  <div class="ql-code-block-container" spellcheck="false"><div class="ql-code-block">Batch: RG-2026-10</div><div class="ql-code-block">Use before: Oct 2028</div></div>`;

const scales = [
  'rose',
  'plum',
  'gold',
  'neutral',
  'success',
  'warning',
  'error',
  'info',
  'teal',
  'violet',
];
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
document.getElementById('palette').innerHTML = scales
  .map(
    (s) =>
      `<div><p class="mb-1 text-sm font-semibold">${s}</p><div class="flex flex-wrap gap-1.5">${steps
        .map(
          (n) =>
            `<div class="bg-surface w-20 overflow-hidden rounded-lg border text-xs"><div class="h-11" style="background:rgb(var(--${s}-${n}-rgb))"></div><span class="text-foreground-muted block px-1.5 py-1">${n}</span></div>`,
        )
        .join('')}</div></div>`,
  )
  .join('');

const pairs = [
  ['background', 'foreground'],
  ['surface', 'foreground'],
  ['surface-muted', 'foreground-muted'],
  ['surface', 'foreground-subtle'],
  ['surface', 'brand-text'],
  ['brand', 'brand-foreground'],
  ['brand-subtle', 'brand-subtle-foreground'],
  ['secondary', 'secondary-foreground'],
  ['secondary-subtle', 'secondary-subtle-foreground'],
  ['accent', 'accent-foreground'],
  ['accent-subtle', 'accent-subtle-foreground'],
  ['success', 'success-foreground'],
  ['warning', 'warning-foreground'],
  ['error', 'error-foreground'],
  ['info', 'info-foreground'],
  ['surface-inverse', 'foreground-inverse'],
];
document.getElementById('semantic').innerHTML = pairs
  .map(
    ([bg, fg]) =>
      `<span class="inline-flex min-w-44 items-center rounded-lg border px-3.5 py-2.5 text-sm" style="background:var(--${bg});color:var(--${fg})">${fg} on ${bg}</span>`,
  )
  .join('');
