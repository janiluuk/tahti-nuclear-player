import { Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  HeadphonesIcon,
  LifeBuoyIcon,
  ListIcon,
  PlugIcon,
  RadioTowerIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Input, Tabs } from '@nuclearplayer/ui';

import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty } from '../components/PageStates';
import { SupportContactForm } from '../components/SupportContactForm';
import {
  getHelpArticle,
  HELP_ARTICLES,
  HELP_HUB_INTRO,
  type HelpArticle,
} from '../content/help';

const PRODUCTION = 'https://tahti.live';

const GUIDE_GROUPS: Array<{
  id: string;
  title: string;
  description: string;
  icon: typeof HeadphonesIcon;
  slugs: string[];
}> = [
  {
    id: 'start-here',
    title: 'Start here',
    description: 'Find something to listen to or set up your artist profile.',
    icon: HeadphonesIcon,
    slugs: ['getting-around', 'for-listeners', 'player', 'for-artists'],
  },
  {
    id: 'listen-and-share',
    title: 'Listen and share',
    description: 'Save music, talk about moments, and share public pages.',
    icon: HeadphonesIcon,
    slugs: [
      'favorites-playlists',
      'comments-and-timeline',
      'notifications',
      'embed-and-share',
    ],
  },
  {
    id: 'artist-tools',
    title: 'Artist tools',
    description: 'Publish music, design your channel, and follow processing.',
    icon: SparklesIcon,
    slugs: ['channel-design', 'uploads-and-processing'],
  },
  {
    id: 'broadcasting',
    title: 'Broadcasting',
    description: 'Get on air and mirror your show to other platforms.',
    icon: RadioTowerIcon,
    slugs: ['broadcast', 'multistream'],
  },
  {
    id: 'releasing',
    title: 'Releasing',
    description:
      'Understand release identifiers, catalogs, smart links, and delivery.',
    icon: BookOpenIcon,
    slugs: ['releasing'],
  },
  {
    id: 'account-support',
    title: 'Account and support',
    description: 'Understand limits, shortcuts, and where to get help.',
    icon: ShieldCheckIcon,
    slugs: ['tier-limits', 'keyboard-shortcuts', 'support'],
  },
  {
    id: 'governance-admin',
    title: 'Governance and admin',
    description: 'Understand member decisions and platform operations.',
    icon: ShieldCheckIcon,
    slugs: ['governance', 'admin-guide'],
  },
  {
    id: 'add-ons',
    title: 'Add-ons',
    description:
      'Themes, imports, live mirrors, audio tools, and page widgets.',
    icon: PlugIcon,
    slugs: ['add-ons', 'desktop-mcp', 'disco-widgets'],
  },
  {
    id: 'build-with-tahti',
    title: 'Build with Tahti',
    description: 'Learn how to make a Disco-widget for the platform.',
    icon: SparklesIcon,
    slugs: ['disco-widgets'],
  },
];

const QUICK_STARTS = [
  {
    title: 'I want to listen',
    description: 'Browse channels, play Tahti Radio, and join the community.',
    slug: 'for-listeners',
    icon: HeadphonesIcon,
  },
  {
    title: 'I want to broadcast',
    description: 'Create a channel and connect your broadcast software.',
    slug: 'for-artists',
    icon: RadioTowerIcon,
  },
  {
    title: 'I need support',
    description: 'Send the team a question about your account or a problem.',
    slug: 'support',
    icon: LifeBuoyIcon,
  },
] as const;

const DOCUMENT_GROUPS = [
  {
    id: 'transparency',
    label: 'Transparency',
    items: [
      {
        title: 'Transparency dashboard',
        description: 'Current ledger, grants, and public financial totals.',
        to: '/transparency',
      },
      {
        title: 'Grant reports',
        description: 'Browse annual grant distribution reports by year.',
        to: '/transparency',
      },
      {
        title: 'Transparency methodology',
        description: 'How figures are recorded, reviewed, and published.',
        to: '/transparency/methodology',
      },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      {
        title: 'Governance history',
        description: 'Public results from closed advisory motions.',
        to: '/governance/history',
      },
      {
        title: 'Member governance',
        description: 'Member motions, voting, discussion, and proposals.',
        to: '/governance',
      },
      {
        title: 'Governance guide',
        description: 'How cooperative decisions and advisory votes work.',
        to: '/help/governance',
      },
    ],
  },
  {
    id: 'legal',
    label: 'Legal & policies',
    items: [
      {
        title: 'About Tahti',
        description: 'Mission, cooperative structure, and commitments.',
        to: '/about',
      },
      {
        title: 'Terms of service',
        description: 'The rules for using Tahti services.',
        to: '/terms',
      },
      {
        title: 'Privacy policy',
        description: 'What data is collected and how it is handled.',
        to: '/privacy',
      },
      {
        title: 'AGPL source licence',
        description: 'The licence and source-code obligations for Tahti.',
        to: '/agpl',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        title: 'Platform status',
        description: 'Current service health and incident information.',
        to: '/status',
      },
      {
        title: 'Support',
        description: 'Contact support about an account or platform problem.',
        to: '/help/support',
      },
      {
        title: 'Admin guide',
        description: 'Operational guidance for board and platform admins.',
        to: '/help/admin-guide',
      },
    ],
  },
] as const;

function articleMatches(article: HelpArticle, query: string): boolean {
  const haystack = [
    article.title,
    article.description,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.body,
      ...(section.table
        ? [...section.table.columns, ...section.table.rows.flat()]
        : []),
    ]),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function sectionId(heading: string, index: number): string {
  const slug = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug || 'section'}-${index}`;
}

function HelpGuideCard({ article }: { article: HelpArticle }) {
  return (
    <Link
      to="/help/$slug"
      params={{ slug: article.slug }}
      className="border-border bg-background-secondary/50 hover:border-primary group flex min-h-36 min-w-0 flex-col justify-between rounded-xl border p-4 transition-colors"
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
      <span className="text-foreground-secondary mt-4 text-xs font-semibold tracking-wide uppercase">
        {article.sections.length}{' '}
        {article.sections.length === 1 ? 'section' : 'sections'}
      </span>
    </Link>
  );
}

export function HelpHubView() {
  const [query, setQuery] = useState('');
  const visibleGroups = useMemo(
    () =>
      GUIDE_GROUPS.map((group) => ({
        ...group,
        articles: group.slugs
          .map((slug) => getHelpArticle(slug))
          .filter(
            (article): article is HelpArticle =>
              article !== undefined && articleMatches(article, query),
          ),
      })).filter((group) => group.articles.length > 0),
    [query],
  );

  return (
    <PageFrame maxWidth="full" className="max-w-full min-w-0 pb-8">
      <PageHeader
        title="Help center"
        subtitle={HELP_HUB_INTRO}
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

      <section
        data-help-documents
        aria-labelledby="help-documents-heading"
        className="border-border bg-background-secondary/30 min-w-0 rounded-2xl border p-4 sm:p-5"
      >
        <div className="mb-3">
          <p className="text-foreground-secondary text-xs font-bold tracking-[0.16em] uppercase">
            Reference library
          </p>
          <h2
            id="help-documents-heading"
            className="font-display mt-1 text-xl font-bold tracking-tight"
          >
            Documents and public records
          </h2>
          <p className="text-foreground-secondary mt-1 text-sm">
            Find transparency, governance, legal, and service documents from one
            place.
          </p>
        </div>
        <Tabs
          items={DOCUMENT_GROUPS.map((group) => ({
            id: group.id,
            label: group.label,
            content: (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.to}
                    className="border-border bg-background hover:border-primary group rounded-xl border p-3 transition-colors"
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {item.title}
                      <ArrowRightIcon
                        size={15}
                        aria-hidden
                        className="text-foreground-secondary transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="text-foreground-secondary mt-1 block text-xs leading-relaxed">
                      {item.description}
                    </span>
                  </a>
                ))}
              </div>
            ),
          }))}
          listClassName="overflow-x-auto"
        />
      </section>

      <section
        data-help-hub-panel
        className="border-border bg-primary text-primary-foreground min-w-0 rounded-2xl border p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-3">
          <CircleHelpIcon size={22} className="mt-0.5 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.16em] uppercase opacity-75">
              A practical guide
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold tracking-tight">
              Start with what you want to do.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed opacity-85">
              Listening is open to everyone. Sign in when you want to save
              favorites, build playlists, chat, or support artists. Artists can
              create a channel in Studio, publish their archive, and broadcast
              with OBS, Mixxx, Traktor, or the browser studio.
            </p>
          </div>
        </div>
      </section>

      <section data-help-hub-panel aria-labelledby="quick-start-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-foreground-secondary text-xs font-bold tracking-[0.16em] uppercase">
              Quick start
            </p>
            <h2
              id="quick-start-heading"
              className="font-display mt-1 text-xl font-bold tracking-tight"
            >
              Pick a path
            </h2>
          </div>
          <span className="text-foreground-secondary hidden text-xs sm:block">
            {HELP_ARTICLES.length} guides
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {QUICK_STARTS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to="/help/$slug"
                params={{ slug: item.slug }}
                className="border-border bg-background-secondary/40 hover:border-primary group flex min-w-0 items-start gap-3 rounded-xl border p-4 transition-colors"
              >
                <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon size={18} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-bold">
                    {item.title}
                    <ChevronRightIcon
                      size={15}
                      aria-hidden
                      className="text-foreground-secondary transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="text-foreground-secondary mt-1 block text-sm leading-relaxed">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        data-help-hub-panel
        aria-labelledby="guide-index-heading"
        className="flex min-w-0 flex-col gap-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-foreground-secondary text-xs font-bold tracking-[0.16em] uppercase">
              Guide index
            </p>
            <h2
              id="guide-index-heading"
              className="font-display mt-1 text-xl font-bold tracking-tight"
            >
              Browse all help
            </h2>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon
              size={16}
              aria-hidden
              className="text-foreground-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guides…"
              aria-label="Search help guides"
              className="pl-9"
            />
          </div>
        </div>

        {visibleGroups.length === 0 ? (
          <PageEmpty
            title="No guides match"
            description={`Try another search${query ? ` instead of “${query}”` : ''}.`}
          />
        ) : (
          <div className="grid min-w-0 gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
            <nav
              aria-label="Help guide sections"
              className="border-border hidden h-fit gap-1 border-l pl-3 lg:sticky lg:top-4 lg:flex lg:flex-col"
            >
              {visibleGroups.map((group) => (
                <a
                  key={group.id}
                  href={`#${group.id}`}
                  className="text-foreground-secondary hover:text-foreground py-1 text-xs font-semibold"
                >
                  {group.title}
                </a>
              ))}
            </nav>
            <div className="flex min-w-0 flex-col gap-8">
              {visibleGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <section
                    key={group.id}
                    id={group.id}
                    className="min-w-0 scroll-mt-4"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <GroupIcon size={18} aria-hidden />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold tracking-tight">
                          {group.title}
                        </h3>
                        <p className="text-foreground-secondary mt-0.5 text-sm">
                          {group.description}
                        </p>
                      </div>
                    </div>
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                      {group.articles.map((article) => (
                        <HelpGuideCard key={article.slug} article={article} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </section>

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

  const articleIndex = HELP_ARTICLES.findIndex((item) => item.slug === slug);
  const previous = articleIndex > 0 ? HELP_ARTICLES[articleIndex - 1] : null;
  const next =
    articleIndex >= 0 && articleIndex < HELP_ARTICLES.length - 1
      ? HELP_ARTICLES[articleIndex + 1]
      : null;

  return (
    <PageFrame maxWidth="full" className="max-w-5xl min-w-0 pb-8">
      <PageHeader
        title={article.title}
        subtitle={article.description}
        back={
          <Link
            to="/help"
            className="text-foreground-secondary inline-flex items-center gap-1 text-xs hover:underline"
          >
            <ArrowLeftIcon size={14} aria-hidden /> Help center
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

      <div className="grid min-w-0 gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="h-fit lg:sticky lg:top-4">
          <div className="border-border bg-background-secondary/40 rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <ListIcon size={16} aria-hidden />
              In this guide
            </div>
            <nav
              className="mt-3 flex flex-col gap-2"
              aria-label="Article sections"
            >
              {article.sections.map((section, index) => (
                <a
                  key={`${section.heading}-${index}`}
                  href={`#${sectionId(section.heading, index)}`}
                  className="text-foreground-secondary hover:text-foreground text-xs leading-relaxed"
                >
                  {index + 1}. {section.heading}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="min-w-0">
          <div className="flex flex-col gap-4">
            {article.sections.map((section, index) => (
              <section
                key={`${section.heading}-${index}`}
                id={sectionId(section.heading, index)}
                className="border-border bg-background-secondary/35 scroll-mt-4 rounded-xl border p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl font-bold tracking-tight">
                      {section.heading}
                    </h2>
                    {section.body.length > 0 ? (
                      <ul className="text-foreground-secondary mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                        {section.body.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                    {section.table ? (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                          <caption className="sr-only">
                            {section.heading}
                          </caption>
                          <thead>
                            <tr className="border-border border-b">
                              {section.table.columns.map((column) => (
                                <th
                                  key={column}
                                  className="text-foreground px-2 py-2 font-semibold"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row) => (
                              <tr
                                key={row.join('|')}
                                className="border-border border-b last:border-b-0"
                              >
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={`${row[0]}-${cellIndex}`}
                                    className="text-foreground-secondary px-2 py-2 align-top leading-relaxed"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {slug === 'support' && (
            <div className="mt-6">
              <SupportContactForm />
            </div>
          )}

          <nav
            aria-label="More help guides"
            className="border-border mt-8 grid gap-3 border-t pt-5 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                to="/help/$slug"
                params={{ slug: previous.slug }}
                className="border-border hover:border-primary group rounded-xl border p-4 transition-colors"
              >
                <span className="text-foreground-secondary flex items-center gap-1 text-xs font-semibold tracking-wide uppercase">
                  <ArrowLeftIcon size={14} aria-hidden /> Previous
                </span>
                <span className="mt-2 block text-sm font-bold">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to="/help/$slug"
                params={{ slug: next.slug }}
                className="border-border hover:border-primary group rounded-xl border p-4 text-right transition-colors"
              >
                <span className="text-foreground-secondary flex items-center justify-end gap-1 text-xs font-semibold tracking-wide uppercase">
                  Next <ArrowRightIcon size={14} aria-hidden />
                </span>
                <span className="mt-2 block text-sm font-bold">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        </article>
      </div>
    </PageFrame>
  );
}
