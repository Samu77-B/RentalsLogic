import type { KeyedMutator, SWRConfiguration } from "swr";

export const swrDefaults: SWRConfiguration = {
  revalidateOnFocus: false,
  keepPreviousData: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  dedupingInterval: 2000,
};

export async function swrFetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : "Request failed"
    );
  }
  return data as T;
}

/** Refresh SWR cache without blanking the UI while fetching. */
export async function reloadSWR<T>(
  mutate: KeyedMutator<T>,
  _url?: string
): Promise<T | undefined> {
  return mutate(undefined, { revalidate: true });
}
