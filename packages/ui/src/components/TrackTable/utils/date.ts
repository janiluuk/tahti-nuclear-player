import { DateTime } from 'luxon';

/** Formats a track's ISO release date for the table's release-date column
 * -- short, locale-aware, no time component. Returns '' when missing or
 * unparsable so the cell just renders blank rather than "Invalid DateTime". */
export const formatReleaseDate = (dateIso: string | undefined): string => {
  if (!dateIso) {
    return '';
  }
  // Parsed as UTC so the displayed date doesn't shift a day depending on
  // the viewer's timezone -- release dates arrive as bare calendar dates.
  const dt = DateTime.fromISO(dateIso, { zone: 'utc' });
  if (!dt.isValid) {
    return '';
  }
  return dt.toFormat('MMM d, yyyy');
};
