import {
  IconBox,
  IconCheckCircle,
  IconDelivery,
  IconFaceScan,
  IconPalette,
  IconShieldCheck,
  IconTagPrice,
} from '@beautinique/frontend-icons';

import type { Route } from './+types/home';

const TITLE = 'Beautinique: beauty you can trust';
const DESCRIPTION =
  'Genuine brands, true-to-life shades and clear prices, every product checked in our own warehouse.';

export const meta: Route.MetaFunction = () => [
  { title: TITLE },
  { name: 'description', content: DESCRIPTION },
  { property: 'og:title', content: TITLE },
  { property: 'og:description', content: DESCRIPTION },
  { property: 'og:type', content: 'website' },
];

/** Why shop here (PRD §2: brand owners only, our warehouse, shades for Indian skin, no hidden charges). */
const PROMISES = [
  {
    Icon: IconShieldCheck,
    title: 'Only genuine brands',
    text: 'Products come only from brand owners and their authorised distributors.',
  },
  {
    Icon: IconPalette,
    title: 'Shades you can trust',
    text: 'Real swatches and shade details, chosen with Indian skin tones in mind.',
  },
  {
    Icon: IconTagPrice,
    title: 'Clear prices',
    text: 'MRP, discount and delivery fee shown upfront. No surprises at checkout.',
  },
  {
    Icon: IconFaceScan,
    title: 'Try before you buy',
    text: 'Virtual try-on shows a shade on your face; the camera never leaves your device.',
  },
];

/** The launch categories (PRD §5). The catalog brings real category pages, with links, in M4. */
const CATEGORIES = ['Skin', 'Makeup', 'Hair', 'Fragrance', 'Bath & Body', "Men's Grooming"];

const STEPS = [
  {
    Icon: IconBox,
    title: 'Stock comes to our warehouse',
    text: 'Brands send their products to our own warehouse, never straight to you.',
  },
  {
    Icon: IconCheckCircle,
    title: 'Every batch is checked',
    text: 'We check that each batch is genuine, sealed and well within its expiry date.',
  },
  {
    Icon: IconDelivery,
    title: 'Delivered to your door',
    text: 'Packed with care and brought home by our own delivery partners.',
  },
];

export default function Home() {
  return (
    <>
      <section aria-labelledby="hero-title" className="bg-brand-subtle">
        <div className="container-page py-16 md:py-24">
          <p className="tone-brand bg-tone text-tone-foreground inline-flex rounded-full px-3 py-1 text-sm font-semibold">
            Launching soon
          </p>
          <h1
            id="hero-title"
            className="font-display mt-5 max-w-3xl text-4xl leading-tight font-medium md:text-6xl"
          >
            Beauty you can <span className="text-brand-gradient">trust</span>
          </h1>
          <p className="text-foreground-muted mt-5 max-w-2xl text-lg">{DESCRIPTION}</p>
          <p className="mt-8">
            <a
              href="#how-it-works"
              className="text-brand-text min-h-touch inline-flex items-center font-semibold underline underline-offset-4"
            >
              See how it works
            </a>
          </p>
        </div>
      </section>

      <section aria-labelledby="why-title" className="container-page py-14">
        <h2 id="why-title" className="font-display text-3xl font-medium">
          Why Beautinique
        </h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ Icon, title, text }) => (
            <li key={title} className="border-border bg-surface rounded-xl border p-5 shadow-xs">
              <Icon size={32} className="text-brand-text" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="text-foreground-muted mt-2">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="categories-title" className="bg-surface-muted">
        <div className="container-page py-14">
          <h2 id="categories-title" className="font-display text-3xl font-medium">
            What you will find
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((category) => (
              <li
                key={category}
                className="bg-surface border-border flex min-h-24 items-center justify-center rounded-xl border p-4 text-center font-semibold"
              >
                {category}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-title"
        tabIndex={-1}
        className="container-page scroll-mt-20 py-14 focus:outline-none"
      >
        <h2 id="how-title" className="font-display text-3xl font-medium">
          How it works
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ Icon, title, text }, index) => (
            <li key={title} className="flex gap-4">
              <span className="tone-brand bg-tone-subtle text-tone-subtle-foreground inline-flex size-12 shrink-0 items-center justify-center rounded-full">
                <Icon size={24} />
              </span>
              <div>
                <h3 className="text-lg font-semibold">
                  <span className="sr-only">Step {index + 1}: </span>
                  {title}
                </h3>
                <p className="text-foreground-muted mt-1">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
