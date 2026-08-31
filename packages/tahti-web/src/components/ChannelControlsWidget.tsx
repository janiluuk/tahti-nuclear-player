import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type ChannelControlSection = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

type Props = {
  sections: ChannelControlSection[];
  className?: string;
  /** Controlled single-open-section (accordion) mode: only the section whose
   * id matches `openId` is open, and opening one closes the rest. Pass
   * alongside `onOpenChange`; when omitted, each section toggles
   * independently via native `<details>` behavior, seeded by `defaultOpen`. */
  openId?: string | null;
  onOpenChange?: (id: string | null) => void;
};

/** Shared collapsible shell for artist channel controls.
 * Keep the controls themselves in their domain components; this widget owns
 * the consistent section chrome used by Studio, Settings, and public editing.
 */
export function ChannelControlsWidget({
  sections,
  className = '',
  openId,
  onOpenChange,
}: Props) {
  const controlled = onOpenChange !== undefined;
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {sections.map((section) => (
        <details
          key={section.id}
          open={
            controlled ? section.id === openId : (section.defaultOpen ?? true)
          }
          onToggle={
            controlled
              ? (event) => {
                  const isOpen = (event.currentTarget as HTMLDetailsElement)
                    .open;
                  onOpenChange(isOpen ? section.id : null);
                }
              : undefined
          }
          className="border-border bg-background-secondary/40 group rounded-xl border shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0">
              <span className="font-display block text-base font-bold tracking-tight">
                {section.title}
              </span>
              {section.description ? (
                <span className="text-foreground-secondary mt-1 block text-sm">
                  {section.description}
                </span>
              ) : null}
            </span>
            <ChevronDownIcon
              size={18}
              aria-hidden
              className="text-foreground-secondary shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-border border-t px-5 py-5">
            {section.children}
          </div>
        </details>
      ))}
    </div>
  );
}
