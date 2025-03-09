import { useEffect, useRef, useState } from 'react';

type UseDebounceThrottleProps = {
  delay: number;
  limit: number;
};

export default function useDebounceThrottle<T>(
  value: T,
  options: UseDebounceThrottleProps
) {
  const { delay, limit } = options;
  const [debouncedValue, SetDebouncedValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      if (now - lastRan.current >= limit) {
        SetDebouncedValue(value);
        lastRan.current = now;
      }
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, limit]);

  return debouncedValue;
  // eg const [inputValue, setInputValue] = useState<string>('');
  // eg like const dtv = useDebouncedThrottleValue(inputValue,{delay: 500, limit: 1000 })
}
