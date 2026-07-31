export interface BlogPost {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string;
  description?: string;
  category?: string;
  tag?: string;
  date?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date;
  readTime?: string;
  image?: string;
  imageThumb?: string;
  images?: string[];
  img?: string;
  imageAlt?: string;
  tags?: string[];
  keywords?: string[];
  metaTags?: any[];
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  published?: boolean;
  slugs?: Record<string, string>;
  blocks?: any[];
  content?: string;
  contentHtml?: string;
  lang?: string | null;
  views?: number;
  likes?: number;
  mentions?: number;
  audioUrl?: string | null;
  author?: string;
  hnId?: string;
  translationStatus?: any;
  imageStatus?: any;
  translationGroupId?: string | null;
  translation_group_id?: string | null;
}

export function isGuidePost(post: BlogPost): boolean {
  const category = (post.category || post.tag || "").toLowerCase();
  return (
    category.includes("manutenção") ||
    category.includes("equipamentos") ||
    category.includes("guia") ||
    category.includes("dicas")
  );
}

export function pickGuidePost(posts: BlogPost[], currentPost?: BlogPost): BlogPost | null {
  const filtered = currentPost ? posts.filter((p) => p.id !== currentPost.id) : posts;
  return filtered.find(isGuidePost) || filtered[0] || null;
}

export function getRelatedPosts(a: BlogPost | BlogPost[], b: BlogPost | BlogPost[], count: number = 3): BlogPost[] {
  let currentPost: BlogPost;
  let allPosts: BlogPost[];
  if (Array.isArray(a)) {
    allPosts = a;
    currentPost = b as BlogPost;
  } else {
    currentPost = a;
    allPosts = b as BlogPost[];
  }
  if (!currentPost || !Array.isArray(allPosts)) return [];
  return allPosts
    .filter((p) => p.id !== currentPost.id && (p.category === currentPost.category || p.tag === currentPost.tag))
    .slice(0, count);
}

export function getInitialPosts(lang?: string): BlogPost[] {
  return [];
}

export async function fetchLivePosts(lang?: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`/api/posts?lang=${lang || "pt"}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.posts && Array.isArray(data.posts)) {
      return data.posts.map((p: any) => ({
        ...p,
        img: p.img || p.image,
        image: p.img || p.image,
        description: p.excerpt || p.description,
        date: p.createdAt ? (typeof p.createdAt === "string" ? p.createdAt : new Date(p.createdAt).toISOString()) : p.date,
        contentHtml: p.contentHtml || p.content || (Array.isArray(p.blocks) ? p.blocks.map((b: any) => b.text || "").join("\n") : ""),
      }));
    }
    return [];
  } catch (err) {
    console.error("Error fetching live posts:", err);
    return [];
  }
}

export async function fetchPosts(lang?: string, forceFresh?: boolean): Promise<BlogPost[]> {
  return fetchLivePosts(lang);
}

export async function editPost(payload: any, lang?: string): Promise<any> {
  const res = await fetch(`/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY || "motonapratica-secret-key-2026",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao salvar post.");
  }
  return res.json();
}

export async function deletePost(target: number | string | BlogPost, lang?: string): Promise<any> {
  const id = typeof target === "object" ? target.id : target;
  const res = await fetch(`/api/posts?id=${id}`, {
    method: "DELETE",
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY || "motonapratica-secret-key-2026",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao deletar post.");
  }
  return res.json();
}
