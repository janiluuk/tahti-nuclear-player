import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CircleHelpIcon,
  HeadphonesIcon,
  RadioTowerIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from 'lucide-react';

import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty } from '../components/PageStates';
import { SupportContactForm } from '../components/SupportContactForm';
import { TahtiMapLink } from '../components/TahtiMapLink';
import {
  getHelpArticle,
  HELP_HUB_INTRO,
  type HelpArticle,
} from '../content/help';

const PRODUCTION = 'https://tahti.live';

const GUIDE_GROUPS: Array<{
  title: string;
  description: string;
  icon: typeof HeadphonesIcon;
  slugs: string[];
}> = [
  {
    title: 'Start here',
    description: 'Find something to listen to or set up your artist profile.',
    icon: HeadphonesIcon,
    slugs: ['for-listeners', 'for-artists'],
  },
  {
    title: 'Broadcasting',
    description: 'Get on air and mirror your show to other platforms.',
    icon: RadioTowerIcon,
    slugs: ['broadcast', 'multistream'],
  },
  {
    title: 'Account and support',
    description: 'Understand limits, shortcuts, and where to get help.',
    icon: ShieldCheckIcon,
    slugs: ['tier-limits', 'keyboard-shortcuts', 'support'],
  },
  {
    title: 'Build with Tahti',
    description: 'Learn how to make a Disco-widget for the platform.',
    icon: SparklesIcon,
    slugs: ['disco-widgets'],
  },
];

function HelpGuideCard({ article }: { article: HelpArticle }) {
  return (
    <Link
      to="/help/$slug"
      params={{ slug: article.slug }}
      className="border-border bg-background-secondary/50 hover:border-primary group flex min-h-32 min-w-0 flex-col justify-between rounded-xl border p-4 transition-colors"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display min-w-0 text-base font-bold tracking-tight">
            {article.title}
          </h3>
          <ArrowRightIcon
            size={17}
            aria-hidden
            className="text-foreground-secondary transition-transform group-hover:translate-x-0.5"
          />
        </div>
        <p className="text-foreground-secondary mt-2 text-sm leading-relaxed">
          {article.description}
        </p>
      </div>
    </Link>
  );
}

export function HelpHubView() {
  return (
    <PageFrame maxWidth="full" className="max-w-full min-w-0 pb-8">
      <PageHeader
        title="Help center"
        subtitle={HELP_HUB_INTRO}
        back={<TahtiMapLink label="← Tahti map" />}
        actions={
          <Link
            to="/about"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors"
          >
            <BookOpenIcon size={16} aria-hidden />
            About Tahti
          </Link>
        }
      />
      <section className="border-border bg-primary text-primary-foreground min-w-0 rounded-2xl border p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <CircleHelpIcon size={22} className="mt-0.5 shrink-0" aria-hidden />
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">
              The essentials
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed opacity-85">
              You can listen without an account. Sign in when you want to save
              favorites, build playlists, chat with your community, or manage an
              artist channel. Artists can create a channel in Studio and use its
              broadcast credentials with OBS, Mixxx, or another live tool.
            </p>
          </div>
        </div>
      </section>

      <div className="flex min-w-0 flex-col gap-8">
        {GUIDE_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const articles = group.slugs
            .map((slug) => getHelpArticle(slug))
            .filter((article): article is HelpArticle => Boolean(article));
          return (
            <section key={group.title} className="min-w-0">
              <div className="mb-3 flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <GroupIcon size={18} aria-hidden />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    {group.title}
                  </h2>
                  <p className="text-foreground-secondary mt-0.5 text-sm">
                    {group.description}
                  </p>
                </div>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {articles.map((article) => (
                  <HelpGuideCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-foreground-secondary border-border border-t pt-5 text-xs">
        Looking for the latest public version?{' '}
        <a
          href={`${PRODUCTION}/help`}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:underline"
        >
          Open tahti.live/help
        </a>
        .
      </p>
    </PageFrame>
  );
}

export function HelpArticleView({ slug }: { slug: string }) {
  const article = getHelpArticle(slug);
  if (!article) {
    return (
      <PageFrame maxWidth="3xl">
        <PageEmpty
          title="Article not found"
          description={`No help page for ${slug}.`}
          action={
            <Link to="/help" className="underline-offset-2 hover:underline">
              Back to help hub
            </Link>
          }
        />
      </PageFrame>
    );
  }

  return (
    <article className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-6">
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
