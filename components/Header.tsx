import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";
import {
  buildAlternatePaths,
  buildPath,
  languageLabels,
  languages,
  siteName,
  type Language,
  type PageKey,
  type Translation,
} from "@/lib/i18n";
import { brandAssets } from "@/lib/branding";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HeaderProps {
  lang: Language;
  pageKey: PageKey;
  t: Translation;
  languagePaths?: Partial<Record<Language, string>>;
}

function HeaderContent({ lang, pageKey, t, languagePaths }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const alternates = languagePaths ?? buildAlternatePaths(pageKey);
  const homePath = buildPath(lang, "home");
  const toolsPath = buildPath(lang, "tools");
  const aboutPath = buildPath(lang, "about");

  const handleLanguageChange = (nextLang: Language) => {
    const targetPath = alternates[nextLang] ?? buildPath(nextLang, pageKey);
    const search = searchParams.toString();
    const searchString = search ? `?${search}` : "";
    // Note: hash is client-only in Next.js, so we push path + search.
    router.push(`${targetPath}${searchString}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link
            href={homePath}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
            aria-label={siteName}
          >
            <Image
              src={brandAssets.logo}
              alt={siteName}
              width={96}
              height={96}
              priority
              className="h-8 sm:h-9 w-auto"
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden lg:flex items-center gap-7">
              <Link
                href={homePath}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.home}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href={aboutPath}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.about}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href={`${homePath}#topics`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.topics}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href={toolsPath}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.tools}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href={`${homePath}#guides`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.newsletter}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            <Select
              value={lang}
              onValueChange={(value) => handleLanguageChange(value as Language)}
            >
              <SelectTrigger
                aria-label={t.labels.language}
                className={cn("h-9 w-[120px] sm:w-[140px]")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((code) => (
                  <SelectItem key={code} value={code}>
                    {languageLabels[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 border-b border-border bg-background/95 h-16" />}>
      <HeaderContent {...props} />
    </Suspense>
  );
}

