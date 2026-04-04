export async function jsonFetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
  });

  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data?.error
        ? data.error
        : `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}