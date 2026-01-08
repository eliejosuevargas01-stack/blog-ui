import "./global.css";

import { BrowserRouter } from "react-router-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "@/lib/helmet";

import { AppRoutes } from "@/AppRoutes";
import { AppShell } from "@/AppShell";
import { ScrollToHash } from "@/ScrollToHash";
import { setInitialPosts } from "@/lib/posts";

const container = document.getElementById("root");

if (container) {
  setInitialPosts(window.__INITIAL_POSTS__ ?? null);

  const app = (
    <HelmetProvider>
      <AppShell>
        <BrowserRouter>
          <ScrollToHash />
          <AppRoutes />
        </BrowserRouter>
      </AppShell>
    </HelmetProvider>
  );

  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}
