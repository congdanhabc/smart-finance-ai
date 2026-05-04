export type FilterType = 'select' | 'date' | 'date-range';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  className?: string;
}

export interface TableState {
  page: number;
  size: number;
  search: string;
  sort_by: string;
  sort_order: "asc" | "desc";
  filters: Record<string, string | number | boolean>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}