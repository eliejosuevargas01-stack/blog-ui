/// <reference types="vite/client" />

import type { BlogPost } from "@/lib/posts";
import type { Language } from "@/lib/i18n";

declare global {
  interface Window {
    __INITIAL_POSTS__?: Partial<Record<Language, BlogPost[]>>;
  }
}
