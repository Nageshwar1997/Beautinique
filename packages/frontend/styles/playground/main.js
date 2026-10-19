import './playground.css';

const LANG_KEY = 'bq-playground-lang';

const COPY = {
  en: {
    eyebrow: 'New · Skincare',
    hero: 'Glow that’s <em class="text-brand-text">truly</em> yours',
    title: 'Bestsellers in Skincare',
    name: 'Rose Glow Vitamin C Serum, 30 ml',
    off: '19% off',
    ratings: '2,341 ratings',
    desc: 'Lightweight serum with 10% vitamin C and rose extract. Brightens dull skin in 4 weeks. Dermatologically tested, for all skin types.',
    cta: 'Add to Bag',
    line: 'Beauty that feels like you',
  },
  hi: {
    eyebrow: 'नया · स्किनकेयर',
    hero: 'आपकी अपनी असली चमक',
    title: 'स्किनकेयर के बेस्टसेलर',
    name: 'रोज़ ग्लो विटामिन C सीरम, 30 ml',
    off: '19% छूट',
    ratings: '2,341 रेटिंग',
    desc: '10% विटामिन C और गुलाब के अर्क वाला हल्का सीरम। 4 हफ़्तों में बेजान त्वचा को निखारता है। त्वचा विशेषज्ञ द्वारा परीक्षित।',
    cta: 'बैग में डालें',
    line: 'सुंदरता जो आप जैसी लगे',
  },
  mr: {
    eyebrow: 'नवीन · स्किनकेअर',
    hero: 'तुमची स्वतःची खरी चमक',
    title: 'स्किनकेअरमधील बेस्टसेलर',
    name: 'रोझ ग्लो व्हिटॅमिन C सीरम, 30 ml',
    off: '19% सूट',
    ratings: '2,341 रेटिंग',
    desc: '10% व्हिटॅमिन C आणि गुलाबाच्या अर्कासह हलके सीरम. 4 आठवड्यांत निस्तेज त्वचा उजळते. विशेष ऑफर फक्त आज.',
    cta: 'बॅगमध्ये टाका',
    line: 'तुमच्यासारखे वाटणारे सौंदर्य',
  },
};

const WEIGHTS = [
  [300, 'font-light'],
  [400, 'font-normal'],
  [500, 'font-medium'],
  [600, 'font-semibold'],
  [700, 'font-bold'],
];
const SIZES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'];

function renderType(lang) {
  const t = COPY[lang];
  document.getElementById('type').innerHTML = `
    <article class="bg-surface rounded-2xl border p-6">
      <p class="text-brand-text text-xs font-semibold uppercase tracking-widest">${t.eyebrow}</p>
      <p class="font-display mt-2 text-5xl font-medium leading-tight">${t.hero}</p>
      <p class="font-display mt-4 text-3xl font-medium">${t.title}</p>
      <p class="text-foreground-muted mt-6 text-xs font-semibold">font-display · Fraunces + Noto Sans Devanagari</p>
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
      <p class="text-foreground-muted mt-6 text-xs font-semibold">font-sans · Plus Jakarta Sans + Noto Sans Devanagari</p>
      <div class="mt-2 flex flex-wrap gap-x-4 text-lg">
        ${WEIGHTS.map(([w, c]) => `<span class="${c}">${w} ₹1,299</span>`).join('')}<span class="italic">${t.line}</span>
      </div>
    </article>`;
  document.getElementById('sizes').innerHTML = SIZES.map(
    (s) => `<div class="flex flex-col gap-1 py-2 sm:flex-row sm:items-baseline sm:gap-4"><code class="text-foreground-subtle w-20 shrink-0 text-xs">${s}</code><p class="${s} min-w-0 max-w-3xl">${t.desc}</p></div>`,
  ).join('');
}

function setLang(lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
  for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  renderType(lang);
}

let saved = 'en';
try {
  saved = localStorage.getItem(LANG_KEY) ?? 'en';
} catch {}
setLang(COPY[saved] ? saved : 'en');
for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset.lang));

document.getElementById('toggle').addEventListener('click', () => {
  const html = document.documentElement;
  html.setAttribute('theme', html.getAttribute('theme') === 'dark' ? 'light' : 'dark');
});
document.getElementById('open-dialog').addEventListener('click', () => document.getElementById('dialog').showModal());

const scales = ['rose', 'plum', 'gold', 'neutral', 'success', 'warning', 'error', 'info'];
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
document.getElementById('palette').innerHTML = scales
  .map(
    (s) =>
      `<div><p class="mb-1 text-sm font-semibold">${s}</p><div class="flex flex-wrap gap-1.5">${steps
        .map((n) => `<div class="bg-surface w-20 overflow-hidden rounded-lg border text-xs"><div class="h-11" style="background:rgb(var(--${s}-${n}-rgb))"></div><span class="text-foreground-muted block px-1.5 py-1">${n}</span></div>`)
        .join('')}</div></div>`,
  )
  .join('');

const pairs = [
  ['background', 'foreground'], ['surface', 'foreground'], ['surface-muted', 'foreground-muted'],
  ['surface', 'foreground-subtle'], ['surface', 'brand-text'], ['brand', 'brand-foreground'],
  ['brand-subtle', 'brand-subtle-foreground'], ['secondary', 'secondary-foreground'],
  ['secondary-subtle', 'secondary-subtle-foreground'], ['accent', 'accent-foreground'],
  ['accent-subtle', 'accent-subtle-foreground'], ['success', 'success-foreground'],
  ['warning', 'warning-foreground'], ['error', 'error-foreground'], ['info', 'info-foreground'],
  ['surface-inverse', 'foreground-inverse'],
];
document.getElementById('semantic').innerHTML = pairs
  .map(([bg, fg]) => `<span class="inline-flex min-w-44 items-center rounded-lg border px-3.5 py-2.5 text-sm" style="background:var(--${bg});color:var(--${fg})">${fg} on ${bg}</span>`)
  .join('');
