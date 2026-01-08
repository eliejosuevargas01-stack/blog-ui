import { Navigate, Route, Routes } from "react-router-dom";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Tools from "@/pages/Tools";
import Post from "@/pages/Post";
import Articles from "@/pages/Articles";
import Latest from "@/pages/Latest";
import Admin from "@/pages/Admin";
import Topic from "@/pages/Topic";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import { defaultLang, languages, pageSlugs, postRouteSegment } from "@/lib/i18n";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${defaultLang}`} replace />} />
      {languages.map((lang) => (
        <Route key={`${lang}-home`} path={`/${lang}`} element={<Index lang={lang} />} />
      ))}
      {languages.map((lang) => (
        <Route
          key={`${lang}-articles`}
          path={`/${lang}/${pageSlugs.articles[lang]}`}
          element={<Articles lang={lang} />}
        />
      ))}
      {languages.map((lang) => (
        <Route
          key={`${lang}-latest`}
          path={`/${lang}/${pageSlugs.latest[lang]}`}
          element={<Latest lang={lang} />}
        />
      ))}
      {languages.map((lang) => (
        <Route
          key={`${lang}-tools`}
          path={`/${lang}/${pageSlugs.tools[lang]}`}
          element={<Tools lang={lang} />}
        />
      ))}
      {languages.map((lang) => (
        <Route
          key={`${lang}-admin`}
          path={`/${lang}/${pageSlugs.admin[lang]}`}
          element={<Admin lang={lang} />}
        />
      ))}
      {languages.map((lang) => (
        <Route
          key={`${lang}-about`}
          path={`/${lang}/${pageSlugs.about[lang]}`}
          element={<About lang={lang} />}
        />
      ))}
      {languages.map((lang) => (
        <Route
          key={`${lang}-contact`}
          path={`/${lang}/${pageSlugs.contact[lang]}`}
          element={<Contact lang={lang} />}
        />
      ))}
      {languages.map((lang) => (
        <Route
          key={`${lang}-privacy`}
          path={`/${lang}/${pageSlugs.privacy[lang]}`}
          element={<Privacy lang={lang} />}
        />
      ))}
      {languages.map((lang) => (
        <Route key={`${lang}-topic`} path={`/${lang}/:topicSlug`} element={<Topic lang={lang} />} />
      ))}
      {languages.map((lang) => (
        <Route
          key={`${lang}-post`}
          path={`/${lang}/${postRouteSegment[lang]}/:slug`}
          element={<Post lang={lang} />}
        />
      ))}
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
