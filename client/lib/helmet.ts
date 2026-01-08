import * as ReactHelmetAsync from "react-helmet-async";

type HelmetExports = {
  Helmet: typeof ReactHelmetAsync.Helmet;
  HelmetProvider: typeof ReactHelmetAsync.HelmetProvider;
  HelmetData?: typeof ReactHelmetAsync.HelmetData;
};

const resolved = (
  "Helmet" in ReactHelmetAsync
    ? ReactHelmetAsync
    : (ReactHelmetAsync as { default?: HelmetExports }).default ??
      ReactHelmetAsync
) as HelmetExports;

export const Helmet = resolved.Helmet;
export const HelmetProvider = resolved.HelmetProvider;
