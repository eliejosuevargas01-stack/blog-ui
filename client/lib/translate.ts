import type { Language } from "@/lib/i18n";
import type { BlogPost } from "@/lib/posts";

export async function translatePosts(
  posts: BlogPost[],
  _lang: Language,
): Promise<BlogPost[]> {
  return posts;
}
