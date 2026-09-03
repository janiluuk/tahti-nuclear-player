import { ComponentProps } from 'react';

export type PaginationLabels = {
  navigation: string;
  previous: string;
  next: string;
  page: (pageNumber: number) => string;
};

export const DEFAULT_PAGINATION_LABELS: PaginationLabels = {
  navigation: 'Pagination',
  previous: 'Previous page',
  next: 'Next page',
  page: (pageNumber) => `Page ${pageNumber}`,
};

export type PaginationProps = ComponentProps<'nav'> & {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  labels?: PaginationLabels;
};
