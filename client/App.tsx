import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Tools from "@/pages/Tools";
import Post from "@/pages/Post";
import Articles from "@/pages/Articles";
import Latest from "@/pages/Latest";
import Admin from "@/pages/Admin";
import Topic from "@/pages/Topic";
import { defaultLang, languages, pageSlugs, postRouteSegment } from "@/lib/i18n";
import { TOPICS } from "@/lib/topics";

const queryClient = new QueryClient();

const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }
    const id = location.hash.replace("#", "");
    if (!id) {
      return;
    }
    const timeout = window.setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [location.hash]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Navigate to={`/${defaultLang}`} replace />} />
          {languages.map((lang) => (
            <Route
              key={`${lang}-home`}
              path={`/${lang}`}
              element={<Index lang={lang} />}
            />
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
          {languages.flatMap((lang) =>
            TOPICS.map((topic) => (
              <Route
                key={`${lang}-topic-${topic.slug}`}
                path={`/${lang}/${topic.slug}`}
                element={<Topic lang={lang} topic={topic.key} />}
              />
            )),
          )}
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
