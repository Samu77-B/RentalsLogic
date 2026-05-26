import type { KeyedMutator } from "swr";

export async function swrFetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data
        ? String(data.error)
        : "Request failed"
    );
  }
  return data as T;
}

/** Replace SWR cache with a fresh fetch from the server. */
export async function reloadSWR<T>(
  mutate: KeyedMutator<T>,
  url: string
): Promise<T | undefined> {
  return mutate(async () => swrFetcher<T>(url), { revalidate: false });
}
