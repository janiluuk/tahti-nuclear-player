import { Link } from '@tanstack/react-router';
import { SendIcon } from 'lucide-react';
import { useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { submitSupportContact, type SupportCategory } from '../api/support';
import { getHelpArticle, HELP_ARTICLES, HELP_HUB_INTRO } from '../content/help';
import { useAuthStore } from '../stores/authStore';

const PRODUCTION = 'https://tahti.live';

const CATEGORY_OPTIONS: { id: SupportCategory; label: string }[] = [
  { id: 'TECHNICAL', label: 'Technical issue' },
  { id: 'FINANCIAL', label: 'Payments / money' },
  { id: 'ENGAGEMENT_DISPUTE', label: 'Engagement dispute' },
  { id: 'OTHER', label: 'Other' },
];

function SupportContactForm() {
  const user = useAuthStore((s) => s.user);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<SupportCategory>('OTHER');
  const [contactEmail, setContactEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    { ok: true; ticketId: string } | { ok: false; error: string } | null
  >(null);

  const needsEmail = !user;
  const canSubmit =
    subject.trim() && message.trim() && (!needsEmail || contactEmail.trim());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    setBusy(true);
    setResult(null);
    const r = await submitSupportContact({
      subject: subject.trim(),
      message: message.trim(),
      category,
      contactEmail: needsEmail ? contactEmail.trim() : undefined,
    });
    setBusy(false);
    setResult(r);
    if (r.ok) {
      setSubject('');
      setMessage('');
      setContactEmail('');
    }
  };

  if (result?.ok) {
    return (
      <div className="border-border rounded-xl border p-4 text-sm">
        <p className="font-semibold">Message sent — thanks.</p>
        <p className="text-foreground-secondary mt-1 text-xs">
          Reference: {result.ticketId}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="border-border flex flex-col gap-3 rounded-xl border p-4"
    >
      <h2 className="font-display text-lg font-bold">Contact support</h2>
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={category === opt.id}
            onClick={() => setCategory(opt.id)}
            className={`rounded-full border px-3 py-1 text-xs ${
              category === opt.id
                ? 'border-primary bg-primary/15 font-semibold'
                : 'border-border text-foreground-secondary hover:border-primary/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <Input
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      {needsEmail && (
        <Input
          label="Your email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          description="So we can reply — you're not signed in."
        />
      )}
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-foreground-secondary text-xs uppercase">
          Message
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm outline-none"
          placeholder="What's going on?"
        />
      </label>
      {result && !result.ok && (
        <p className="text-accent-red text-xs">{result.error}</p>
      )}
      <Button
        type="submit"
        disabled={!canSubmit || busy}
        className="self-start"
      >
        <SendIcon size={14} aria-hidden className="mr-1.5" />
        {busy ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}

export function HelpHubView() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/more"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Tahti map
      </Link>
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Help center
        </h1>
        <p className="text-foreground-secondary mt-2 text-sm">
          {HELP_HUB_INTRO}
        </p>
      </div>
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
      <SupportContactForm />
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
    </div>
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
      <Link
        to="/help"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Help
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {article.title}
        </h1>
        <p className="text-foreground-secondary text-sm">
          {article.description}
        </p>
        <a
          href={`${PRODUCTION}${article.productionPath}`}
          target="_blank"
          rel="noreferrer"
          className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
        >
          Open on tahti.live{article.productionPath}
        </a>
      </header>
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
    </article>
  );
}
