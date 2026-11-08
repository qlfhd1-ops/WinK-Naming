import { redirect } from "next/navigation";

const VALID_TYPES = new Set([
  "baby",
  "me",
  "rename",
  "activity",
  "brand",
  "pet",
  "global",
]);

function normalizeType(value: string | undefined) {
  if (!value) return "baby";
  return VALID_TYPES.has(value) ? value : "baby";
}

export default async function DesignPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const typeValue = Array.isArray(params.type) ? params.type[0] : params.type;
  const categoryValue = Array.isArray(params.category) ? params.category[0] : params.category;
  const nextType = normalizeType(typeValue ?? categoryValue);

  const qs = new URLSearchParams();
  qs.set("type", nextType);
  for (const [key, value] of Object.entries(params)) {
    if (key === "type" || key === "category") continue;
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }

  redirect(`/ko/design?${qs.toString()}`);
}