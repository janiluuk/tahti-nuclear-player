import { Link } from '@tanstack/react-router';

import { PageFrame, PageHeader } from '../components/PageHeader';
import { SupportContactForm } from '../components/SupportContactForm';
import { TahtiMapLink } from '../components/TahtiMapLink';
import { getHelpArticle, HELP_ARTICLES, HELP_HUB_INTRO } from '../content/help';

const PRODUCTION = 'https://tahti.live';

export function HelpHubView() {
  return (
    <PageFrame maxWidth="3xl">
      <PageHeader
        title="Help center"
        subtitle={HELP_HUB_INTRO}
        back={<TahtiMapLink />}
      />
      <ul className="flex flex-col gap-4">
        {HELP_ARTICLES.map((article) => (
          <li key={article.slug} className="border-border border-b pb-4">
            <Link
              to="/help/$slug"
              params={{ slug: article.slug }}
              className="font-display text-lg font-bold tracking-tight hover:underline"
            >
              {article.title}
            </Link>
            <p className="text-foreground-secondary mt-1 text-sm">
              {article.description}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-foreground-secondary text-xs">
        More help:{' '}
        <a
          href={`${PRODUCTION}/help`}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:underline"
        >
          tahti.live/help
        </a>
      </p>
    </PageFrame>
  );
}

export function HelpArticleView({ slug }: { slug: string }) {
  const article = getHelpArticle(slug);
  if (!article) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Link
          to="/help"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Help
        </Link>
        <h1 className="font-display text-2xl font-bold">Article not found</h1>
        <p className="text-foreground-secondary text-sm">
          No help page for <code>{slug}</code>.{' '}
          <Link to="/help" className="underline-offset-2 hover:underline">
            Back to help hub
          </Link>
        </p>
      </div>
    );
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={article.title}
        subtitle={article.description}
        back={
          <Link
            to="/help"
            className="text-foreground-secondary text-xs hover:underline"
          >
            ← Help
          </Link>
        }
        meta={
          article.productionPath ? (
            <a
              href={`${PRODUCTION}${article.productionPath}`}
              target="_blank"
              rel="noreferrer"
              className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
            >
              Open on tahti.live{article.productionPath}
            </a>
          ) : null
        }
      />
      {article.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {section.heading}
          </h2>
          <ul className="text-foreground-secondary list-disc space-y-1 pl-5 text-sm">
            {section.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
      {slug === 'support' && <SupportContactForm />}
    </article>
  );
}
