/**
 * Domain data hooks. Screens use these instead of calling services directly, e.g.
 *   const { data: pgs, isLoading, error } = usePGs();
 */

import { useAsync } from './useAsync';
import {
  getPGs,
  getPGById,
  getPGsByIds,
  searchPGs,
  filterPGs,
} from '@/services/pg.service';

export function usePGs() {
  return useAsync(() => getPGs(), []);
}

export function usePG(id) {
  return useAsync(() => getPGById(id), [id], { enabled: !!id });
}

export function usePGsByIds(ids) {
  const key = (ids || []).join(',');
  return useAsync(() => getPGsByIds(ids), [key], { enabled: (ids || []).length > 0, initialData: [] });
}

export function useSearchPGs(query) {
  return useAsync(() => searchPGs(query), [query]);
}

export function useFilteredPGs(filters) {
  const key = JSON.stringify(filters || {});
  return useAsync(() => filterPGs(filters), [key]);
}
