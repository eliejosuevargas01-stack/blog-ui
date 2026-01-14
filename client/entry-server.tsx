import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "@/lib/helmet";
import type { HelmetServerState } from "react-helmet-async";

import { AppRoutes } from "@/AppRoutes";
import { AppShell } from "@/AppShell";

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <AppShell>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AppShell>
    </HelmetProvider>,
  );

  return {
    appHtml,
    helmet: helmetContext.helmet,
  };
}
