import { Link } from "react-router-dom";

import { buildPath, type Language, type Translation } from "@/lib/i18n";

interface FooterProps {
  lang: Language;
  t: Translation;
}

export function Footer({ lang, t }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const homePath = buildPath(lang, "home");
  const toolsPath = buildPath(lang, "tools");
  const authPath = buildPath(lang, "auth");

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary via-secondary to-primary rounded-lg flex items-center justify-center text-primary font-bold">
                S
              </div>
              <h3 className="font-bold text-lg">seommerce.shop</h3>
            </div>
            <p className="text-sm opacity-80">{t.footer.tagline}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.sectionsTitle}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link
                  to={homePath}
                  className="hover:text-secondary transition-colors"
                >
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: homePath, hash: "#featured" }}
                  className="hover:text-secondary transition-colors"
                >
                  {t.featured.title}
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: homePath, hash: "#topics" }}
                  className="hover:text-secondary transition-colors"
                >
                  {t.categories.title}
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: homePath, hash: "#newsletter" }}
                  className="hover:text-secondary transition-colors"
                >
                  {t.newsletter.title}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.resourcesTitle}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link
                  to={toolsPath}
                  className="hover:text-secondary transition-colors"
                >
                  {t.nav.tools}
                </Link>
              </li>
              <li>
                <Link
                  to={`${authPath}?tab=login`}
                  className="hover:text-secondary transition-colors"
                >
                  {t.nav.login}
                </Link>
              </li>
              <li>
                <Link
                  to={`${authPath}?tab=signup`}
                  className="hover:text-secondary transition-colors"
                >
                  {t.nav.signup}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.followTitle}</h4>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-primary-foreground/10 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.072 4.072 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.095 4.095 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.616 11.616 0 0 0 6.29 1.84" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-primary-foreground/10 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.474-2.236-1.66-2.236-1.14 0-1.822.767-2.122 1.504-.11.26-.138.63-.138 1.001v5.3h-3.554s.047-8.6 0-9.495h3.554v1.346c.42-.647 1.173-1.566 2.85-1.566 2.082 0 3.641 1.36 3.641 4.286v5.429zM5.337 8.855c-1.144 0-1.89-.767-1.89-1.724 0-.96.74-1.724 1.875-1.724 1.141 0 1.89.764 1.908 1.724 0 .957-.767 1.724-1.893 1.724zm1.637 11.597H3.585V9.957h3.389v10.495zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-primary-foreground/10 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-80">
            {t.footer.copyright.replace("{year}", String(currentYear))}
          </p>
          <p className="text-sm opacity-80">{t.footer.bottomLine}</p>
        </div>
      </div>
    </footer>
  );
}
