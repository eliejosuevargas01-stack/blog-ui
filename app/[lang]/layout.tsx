import { notFound } from "next/navigation";
import { languages, type Language } from "@/lib/i18n";
import { Toaster } from "@/components/ui/toaster";

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;
  
  if (!languages.includes(lang as Language)) {
    notFound();
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
