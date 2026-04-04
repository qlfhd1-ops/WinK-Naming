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
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const params = await searchParams;
  const nextType = normalizeType(params.type ?? params.category);

  redirect(`/ko/design?type=${nextType}`);
}