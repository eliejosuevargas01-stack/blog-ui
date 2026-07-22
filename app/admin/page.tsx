import Admin from "@/components/Admin";
import { defaultLang, type Language } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    lang?: string;
  };
}

export default function AdminPage({ searchParams }: PageProps) {
  const lang = (searchParams.lang === "en" || searchParams.lang === "es")
    ? (searchParams.lang as Language)
    : defaultLang;
  return <Admin lang={lang} />;
}
