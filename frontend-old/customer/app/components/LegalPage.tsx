import type { ReactNode } from 'react';

/**
 * The legal documents' version the sign-up consent records (identity's IDENTITY__LEGAL_VERSION,
 * default `dummy-1`). Change both together.
 */
export const LEGAL_VERSION = 'dummy-1';

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

/**
 * A legal page of the dummy brand (ARCHITECTURE §9.2): marked DUMMY at the top, with its version
 * and date, so nobody takes it for a real agreement. Pre-rendered (react-router.config.ts).
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  /** `2 Nov 2026` */
  updated: string;
  intro: ReactNode;
  sections: readonly LegalSection[];
}) {
  return (
    <article aria-labelledby="legal-title" className="container-page max-w-3xl py-10 sm:py-14">
      <p>
        <span className="tone-warning bg-tone-subtle text-tone-subtle-foreground inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
          DUMMY: a sample document for a portfolio project
        </span>
      </p>
      <h1 id="legal-title" className="font-display mt-4 text-3xl font-medium sm:text-4xl">
        {title}
      </h1>
      <p className="text-foreground-muted mt-2 text-sm">
        Version {LEGAL_VERSION} · Last updated {updated}
      </p>
      <div className="mt-6 max-w-prose space-y-4">{intro}</div>
      {sections.map((section) => (
        <section key={section.heading} className="mt-8 max-w-prose">
          <h2 className="font-display text-xl font-medium">{section.heading}</h2>
          <div className="mt-2 space-y-3">{section.body}</div>
        </section>
      ))}
    </article>
  );
}
