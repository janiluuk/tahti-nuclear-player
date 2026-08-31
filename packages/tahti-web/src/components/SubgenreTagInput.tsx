import { XIcon } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

const MAX_SUBGENRES = 12;
const MAX_SUBGENRE_LENGTH = 40;

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  /** Known subgenres to offer via the browser's native datalist dropdown —
   * purely a convenience; any freehand text is accepted just the same. */
  suggestions?: string[];
};

/** Free-text tag input for track subgenres — type a name and press Tab or
 * Enter to commit it as a chip, matching the archive item's `subGenres`
 * field (up to 12 entries, 40 chars each — same limits the backend
 * enforces in ArchiveMetadataFieldsSchema). */
export function SubgenreTagInput({ value, onChange, suggestions = [] }: Props) {
  const [draft, setDraft] = useState('');
  const atLimit = value.length >= MAX_SUBGENRES;
  const listId = 'subgenre-suggestions';

  const commit = () => {
    const tag = draft.trim().slice(0, MAX_SUBGENRE_LENGTH);
    setDraft('');
    if (!tag || atLimit) {
      return;
    }
    if (
      value.some((existing) => existing.toLowerCase() === tag.toLowerCase())
    ) {
      return;
    }
    onChange([...value, tag]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab' || event.key === 'Enter') {
      if (draft.trim()) {
        event.preventDefault();
        commit();
      }
      return;
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="subgenre-input"
        className="text-foreground text-sm font-semibold"
      >
        Subgenres
      </label>
      <div className="border-border bg-background focus-within:ring-primary flex flex-wrap items-center gap-1.5 rounded-md border p-2 focus-within:ring-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-background-secondary text-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Remove ${tag}`}
              className="text-foreground-secondary hover:text-foreground"
            >
              <XIcon size={12} aria-hidden />
            </button>
          </span>
        ))}
        {!atLimit && (
          <input
            id="subgenre-input"
            list={suggestions.length > 0 ? listId : undefined}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            placeholder={
              value.length === 0
                ? 'Type a subgenre, press Tab to add'
                : 'Add another…'
            }
            className="text-foreground min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
          />
        )}
      </div>
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
      <p className="text-foreground-secondary text-xs">
        {value.length} / {MAX_SUBGENRES} · Press Tab or Enter to add.
      </p>
    </div>
  );
}
