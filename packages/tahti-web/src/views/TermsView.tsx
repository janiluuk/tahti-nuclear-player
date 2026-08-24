import { Link } from '@tanstack/react-router';

import { LegalDocSection, LegalDocShell } from '../components/LegalDocShell';

const p = 'text-foreground-secondary text-sm leading-relaxed';
const ul = 'text-foreground-secondary list-disc space-y-1 pl-5 text-sm';

export function TermsView() {
  return (
    <LegalDocShell
      title="Terms of service"
      meta="Last updated: 1 August 2026. These terms govern your use of tahti.live."
    >
      <LegalDocSection title="Who can use Tahti">
        <p className={p}>
          <strong className="text-foreground">Listeners</strong> — anyone can
          browse channels, listen to live broadcasts and archives, and support
          artists through fan subscriptions without an account.
        </p>
        <p className={p}>
          <strong className="text-foreground">Artists</strong> — artist accounts
          are available by invitation during the closed beta. After public
          launch, any independent artist can register. You must be at least 18
          years old, or have parental consent if required by your jurisdiction.
        </p>
      </LegalDocSection>

      <LegalDocSection title="Content licence">
        <p className={p}>
          You retain full copyright over everything you upload or broadcast on
          Tahti. By uploading or broadcasting, you grant Tahti ry a
          non-exclusive, worldwide, royalty-free licence to:
        </p>
        <ul className={ul}>
          <li>Stream your content to listeners.</li>
          <li>Store and serve your archive items.</li>
          <li>Generate thumbnails and waveform previews.</li>
          <li>
            Distribute your content to DSPs if you opt in to distribution.
          </li>
          <li>Include your content in the Tahti Radio meta-stream rotation.</li>
        </ul>
        <p className={p}>
          This licence ends when you delete the content or close your account.
          Content submitted for DSP distribution may take up to 30 days to be
          withdrawn from third-party stores after deletion.
        </p>
      </LegalDocSection>

      <LegalDocSection title="Your responsibilities">
        <p className={p}>
          You must only upload or broadcast content for which you hold the
          necessary rights. You are responsible for:
        </p>
        <ul className={ul}>
          <li>
            Ensuring you have cleared all samples, covers, and third-party
            material.
          </li>
          <li>
            Holding a valid PPL/GVL licence or equivalent if required in your
            territory.
          </li>
          <li>Ensuring your content does not contain illegal material.</li>
        </ul>
      </LegalDocSection>

      <LegalDocSection title="Prohibited content">
        <p className={p}>The following content is not permitted on Tahti:</p>
        <ul className={ul}>
          <li>
            Content that infringes copyright or other intellectual property
            rights.
          </li>
          <li>Illegal content under Finnish law or EU regulations.</li>
          <li>Hate speech, harassment, or targeted abuse.</li>
          <li>Content that promotes violence or self-harm.</li>
          <li>Spam, phishing, or malware.</li>
        </ul>
      </LegalDocSection>

      <LegalDocSection title="Platform rules">
        <ul className={ul}>
          <li>
            One account per person. Shared artist accounts are allowed with all
            members&rsquo; consent.
          </li>
          <li>
            No automated scraping or bulk API access without written permission.
          </li>
          <li>
            No circumvention of access controls, rate limits, or security
            measures.
          </li>
          <li>
            Fan subscription income is paid out to the bank account linked to
            your Stripe Connect account. You are responsible for declaring this
            income for tax purposes.
          </li>
        </ul>
      </LegalDocSection>

      <LegalDocSection title="Platform conduct — what Tahti will not do">
        <p className={p}>
          By the organisation&rsquo;s constitution, Tahti ry is prohibited from:
          advertising in the listener-facing product, selling your data,
          applying algorithmic recommendation to surface content, and gating
          free-tier features in ways that punish non-paying listeners. These are
          constitutional commitments, not policy preferences.
        </p>
      </LegalDocSection>

      <LegalDocSection title="AGPL and your content">
        <p className={p}>
          The Tahti platform software is AGPL-3.0 licensed. This licence governs
          the software, not your content. Your music, recordings, and creative
          work are not subject to the AGPL.
        </p>
      </LegalDocSection>

      <LegalDocSection title="Suspension and termination">
        <p className={p}>
          We may suspend or terminate accounts that violate these terms. For
          serious violations (illegal content, fraud), accounts may be suspended
          immediately without notice. For other violations, we will attempt to
          contact you before taking action.
        </p>
        <p className={p}>
          You may close your account at any time from Settings. Account closure
          triggers deletion of personal data per our{' '}
          <Link to="/privacy" className="underline-offset-2 hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </LegalDocSection>

      <LegalDocSection title="Limitation of liability">
        <p className={p}>
          Tahti is provided &ldquo;as is.&rdquo; We aim for the highest possible
          reliability and quality (it is a constitutional obligation) but cannot
          guarantee uninterrupted service. To the extent permitted by Finnish
          law, Tahti ry&rsquo;s liability is limited to the amount you paid for
          the service in the preceding 12 months.
        </p>
      </LegalDocSection>

      <LegalDocSection title="Governing law">
        <p className={p}>
          These terms are governed by Finnish law. Disputes shall be resolved in
          the District Court of Helsinki, unless EU consumer protection law
          requires otherwise.
        </p>
      </LegalDocSection>

      <LegalDocSection title="Changes to these terms">
        <p className={p}>
          We will notify registered artists by email at least 30 days before
          material changes take effect. Continued use after the effective date
          constitutes acceptance of the updated terms.
        </p>
      </LegalDocSection>

      <LegalDocSection title="Contact">
        <p className={p}>
          Questions about these terms:{' '}
          <a
            href="mailto:legal@tahti.live"
            className="underline-offset-2 hover:underline"
          >
            legal@tahti.live
          </a>
        </p>
      </LegalDocSection>
    </LegalDocShell>
  );
}
