import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  buildAlternatePaths,
  buildPath,
  languageLabels,
  languages,
  type Language,
  type PageKey,
  type Translation,
} from "@/lib/i18n";
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

export function Header({ lang, pageKey, t, languagePaths }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const alternates = languagePaths ?? buildAlternatePaths(pageKey);
  const homePath = buildPath(lang, "home");
  const toolsPath = buildPath(lang, "tools");
  const authPath = buildPath(lang, "auth");

  const handleLanguageChange = (nextLang: Language) => {
    const targetPath = alternates[nextLang] ?? buildPath(nextLang, pageKey);
    navigate(`${targetPath}${location.search}${location.hash}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link
            to={homePath}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary to-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-bold">
              S
            </div>
            <span className="hidden sm:inline text-foreground">
              seommerce
              <span className="text-secondary">.shop</span>
            </span>
            <span className="sm:hidden text-foreground">seommerce</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden lg:flex items-center gap-7">
              <Link
                to={homePath}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.home}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                to={{ pathname: homePath, hash: "#topics" }}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.topics}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                to={toolsPath}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.tools}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                to={{ pathname: homePath, hash: "#newsletter" }}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {t.nav.newsletter}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            <Link
              to={`${authPath}?tab=login`}
              className="sm:hidden px-3 py-2 text-sm font-semibold border border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-all"
            >
              {t.nav.login}
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <Link
                to={`${authPath}?tab=login`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                to={`${authPath}?tab=signup`}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:shadow-lg transition-all hover:shadow-secondary/20 hover:scale-105"
              >
                {t.nav.signup}
              </Link>
            </div>

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
