import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { LegalHubLinks } from '../views/LegalView';

export function LegalDocSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function LegalDocShell({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/more"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Tahti map
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="text-foreground-secondary text-sm">{meta}</p>
      </header>
      {children}
      <LegalHubLinks />
    </article>
  );
}
