import { FilterState } from '@/hooks/useFilter';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function waitFor(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncateText(text: string, maxLength: number, ellipsis = '...') {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + ellipsis;
}

export function compositeRoute(
  routeTemplate: string,
  params: Record<string, string | number | undefined> = {}
): string {
  return routeTemplate.replace(/:\w+/g, (match) => {
    const key = match.substring(1);
    return encodeURIComponent(String(params[key] || ''));
  });
}
//Example
// const route = compositeRoute('/users/:userId/orders/:orderId', {
//   userId: 123,
//   orderId: 456
// });
// utils.ts
export function buildQueryString(params: Record<string, any>): string {
  const queryString = Object.entries(params)
    .map(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');

  return queryString ? `?${queryString}` : '';
}

export function parseQueryString(queryString: string): Record<string, any> {
  if (!queryString) return {};

  // Remove leading "?" if present
  const cleanQuery = queryString.replace(/^\?/, '');
  const filters: Record<string, any> = {};

  cleanQuery.split('&').forEach(pair => {
    if (!pair) return;

    const [key, value] = pair.split('=');
    if (!key || value === undefined) return;

    const decodedKey = decodeURIComponent(key.trim());
    const decodedValue = decodeURIComponent(value.trim());

    filters[decodedKey] = !isNaN(Number(decodedValue)) 
      ? Number(decodedValue) 
      : decodedValue;
  });

  return filters;
}


export function buildUrlWithQuery(route: string, params: Record<string, any>): string {
  const queryString = buildQueryString(params);
  return `${route}${queryString}`;
} 

export function isEmptyObject(object: Record<string, any>): boolean {
  const keys = Object.keys(object);
  return keys.length === 0;
}
