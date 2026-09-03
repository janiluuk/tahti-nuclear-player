import { createContext, useContext } from 'react';

import type { LogEntryData } from '../LogEntry';

type SearchResult = {
  regex: RegExp | null;
  isValid: boolean;
};

export type LogDateRange = { from: Date | null; to: Date | null };

export type LogViewerLabels = {
  searchPlaceholder: string;
  searchAriaLabel: string;
  levelLabel: string;
  scopeLabel: string;
  clearButton: string;
  exportButton: string;
  openLogFolderButton: string;
  noLogsMessage: string;
  invalidRegexMessage: string;
  entryCount: (count: number) => string;
  dateRangeButtonLabel: string;
  dateRangeFromLabel: string;
  dateRangeToLabel: string;
  dateRangeApplyButton: string;
  dateRangeClearButton: string;
  entryDetailTitle: string;
};

export const defaultLabels: LogViewerLabels = {
  searchPlaceholder: 'Search logs...',
  searchAriaLabel: 'Search logs',
  levelLabel: 'Level:',
  scopeLabel: 'Scope:',
  clearButton: 'Clear',
  exportButton: 'Export',
  openLogFolderButton: 'Open Log Folder',
  noLogsMessage: 'No logs to display',
  invalidRegexMessage: 'Invalid regex pattern',
  entryCount: (count) => (count === 1 ? '1 entry' : `${count} entries`),
  dateRangeButtonLabel: 'Date range',
  dateRangeFromLabel: 'From',
  dateRangeToLabel: 'To',
  dateRangeApplyButton: 'Apply',
  dateRangeClearButton: 'Clear',
  entryDetailTitle: 'Log entry',
};

export type LogViewerContextValue = {
  logs: LogEntryData[];
  filteredLogs: LogEntryData[];
  scopes: string[];

  search: string;
  setSearch: (value: string) => void;
  searchResult: SearchResult;

  selectedLevels: string[];
  setSelectedLevels: (levels: string[]) => void;

  selectedScopes: string[];
  setSelectedScopes: (scopes: string[]) => void;

  dateRange: LogDateRange;
  setDateRange: (range: LogDateRange) => void;

  selectedEntry: LogEntryData | null;
  setSelectedEntry: (entry: LogEntryData | null) => void;

  onClear: () => void;
  onExport: () => void | Promise<void>;
  onOpenLogFolder: () => void;

  labels: LogViewerLabels;
};

export const LogViewerContext = createContext<LogViewerContextValue | null>(
  null,
);

export const useLogViewerContext = () => {
  const ctx = useContext(LogViewerContext);
  if (!ctx) {
    throw new Error('LogViewer.* must be used within <LogViewer.Root>');
  }
  return ctx;
};

export const parseSearch = (pattern: string): SearchResult => {
  if (!pattern) {
    return { regex: null, isValid: true };
  }
  try {
    return { regex: new RegExp(pattern, 'i'), isValid: true };
  } catch {
    return { regex: null, isValid: false };
  }
};
