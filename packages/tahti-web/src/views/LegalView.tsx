import { Link } from '@tanstack/react-router';

import { PageEmpty } from '../components/PageStates';
import { TahtiMapLink } from '../components/TahtiMapLink';
import { getLegalPage, LEGAL_HUB_LINKS } from '../content/legal';

const PRODUCTION = 'https://tahti.live';

export function LegalHubLinks() {
  return (
    <ul className="text-foreground-secondary flex flex-wrap gap-3 text-xs">
      {LEGAL_HUB_LINKS.map((l) => (
        <li key={l.slug}>
          <Link to={l.to} className="underline-offset-2 hover:underline">
            {l.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function LegalView({ slug }: { slug: string }) {
  const page = getLegalPage(slug);
  if (!page) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <TahtiMapLink />
        <PageEmpty title="Page not found" />
      </div>
    );
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <TahtiMapLink />
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {page.title}
        </h1>
        <p className="text-foreground-secondary text-sm">{page.description}</p>
        <a
          href={`${PRODUCTION}${page.productionPath}`}
          target="_blank"
          rel="noreferrer"
          className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
        >
          Full page on tahti.live{page.productionPath}
        </a>
      </header>
      {page.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {section.heading}
          </h2>
          {section.paragraphs.map((p) => (
            <p
              key={p.slice(0, 48)}
              className="text-foreground-secondary text-sm leading-relaxed"
            >
              {p}
            </p>
          ))}
        </section>
      ))}
      <LegalHubLinks />
    </article>
  );
}
