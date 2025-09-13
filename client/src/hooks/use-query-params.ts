import { useLocation, useSearch } from "wouter";
import { useMemo, useCallback } from "react";

type ParamValue = string | number | undefined;

export function useQueryParams<T extends Record<string, ParamValue>>(
  defaults: T
) {
  const [location, setLocation] = useLocation();
  const search = useSearch();

  const params = useMemo(() => {
    const searchParams = new URLSearchParams(search);
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });

    // ✅ merge defaults with URL params
    return { ...defaults, ...obj } as T;
  }, [search, defaults]);

  const setParams = useCallback(
    (newParams: Partial<T>, replace = false) => {
      const searchParams = new URLSearchParams(search);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          searchParams.delete(key);
        } else {
          searchParams.set(key, String(value));
        }
      });

      const query = searchParams.toString();
      setLocation(`${location.split("?")[0]}${query ? `?${query}` : ""}`, {
        replace,
      });
    },
    [location, search, setLocation]
  );

  return [params, setParams] as const;
}
