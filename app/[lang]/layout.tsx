import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isSupportedLang } from "@/lib/lang-config";
import AppShell from "@/components/AppShell";

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isSupportedLang(lang)) {
    notFound();
  }

  return <AppShell lang={lang}>{children}</AppShell>;
}