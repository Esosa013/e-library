'use client';
import { useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
  [key: string]: any;
}

export function useFilter() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filters');
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    if (filterParam) {
      try {
        const decodedFilters = JSON.parse(decodeURIComponent(filterParam));
        setFilters(decodedFilters);
      } catch (error) {
        console.error('Error parsing filter params:', error);
        setFilters({});
      }
    }
  }, [filterParam]);

  const applyFilters = useCallback(
    (page: string, newFilters: FilterState) => {
      const encodedFilters = encodeURIComponent(JSON.stringify(newFilters));
      const newUrl = `${page}?filters=${encodedFilters}`;
      setFilters(newFilters);
      router.push(newUrl);
      return newUrl;
    },
    [router]
  );
  

  const resetFilters = useCallback(
    (url: string) => {
      setFilters({});
      router.push(url);
    },
    [router]
  );

  return {
    filters,
    applyFilters,
    resetFilters,
  };
}
