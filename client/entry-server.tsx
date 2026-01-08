import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import ReactHelmetAsync from "react-helmet-async";

import { AppRoutes } from "@/AppRoutes";
import { AppShell } from "@/AppShell";

const { HelmetProvider } = ReactHelmetAsync;

export function render(url: string) {
  const helmetContext: { helmet?: { toString?: () => string } } = {};

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
