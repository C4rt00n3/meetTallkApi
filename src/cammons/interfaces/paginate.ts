export interface Paginate<T> {
    currentPage: number;
    prevPage: number | null;
    nextPage: number | null;
    total: number;
    items: T[];
  }