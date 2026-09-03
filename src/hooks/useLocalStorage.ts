import { useState, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  deserialize?: (raw: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const deserialize = options?.deserialize ?? ((raw: string) => JSON.parse(raw) as T);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? deserialize(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (valueOrUpdater) => {
      setStoredValue((prev) => {
        const next =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (prev: T) => T)(prev)
            : valueOrUpdater;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // 저장 실패 시 메모리 상태는 유지
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
