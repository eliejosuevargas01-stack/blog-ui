import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  buildPath,
  defaultLang,
  getLanguageFromPath,
  translations,
} from "@/lib/i18n";

const NotFound = () => {
  const location = useLocation();
  const lang = getLanguageFromPath(location.pathname) ?? defaultLang;
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.notFound.title;
  }, [lang, t.meta.notFound.title]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="text-5xl font-bold mb-3 text-foreground">404</h1>
        <p className="text-2xl font-semibold text-foreground mb-3">
          {t.notFound.title}
        </p>
        <p className="text-lg text-foreground/70 mb-6">
          {t.notFound.description}
        </p>
        <Link
          to={buildPath(lang, "home")}
          className="inline-flex items-center justify-center px-6 py-3 border-2 border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all"
        >
          {t.notFound.cta}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
