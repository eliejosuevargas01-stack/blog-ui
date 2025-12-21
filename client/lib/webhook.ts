import type { Language } from "@/lib/i18n";

export const WEBHOOK_URL =
  "https://myn8n.seommerce.shop/webhook/seommerce_blog";

export type WebhookAction =
  | "login"
  | "singin"
  | "get_posts"
  | "edit_post"
  | "delete_post";

type MetaTag = { name?: string; property?: string; content: string };

export type WebhookPayload =
  | {
      action: "login" | "singin";
      email: string;
      password: string;
      name?: string;
      lang: Language;
    }
  | {
      action: "get_posts";
      lang: Language;
    }
  | {
      action: "edit_post";
      lang: Language;
      id: string;
      title: string;
      slug?: string;
      excerpt?: string;
      description?: string;
      content?: string;
      contentHtml?: string;
      categoria?: string;
      category?: string;
      image?: string;
      imageAlt?: string;
      imageThumb?: string;
      images?: string[];
      tags?: string[];
      date?: string;
      author?: string;
      readTime?: string;
      featured?: boolean;
      metaTitle?: string;
      metaDescription?: string;
      metaTags?: MetaTag[];
      token?: string;
    }
  | {
      action: "delete_post";
      lang: Language;
      id: string;
      slug?: string;
      token?: string;
    };

export async function sendWebhook(payload: WebhookPayload) {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data && typeof data === "object" && "message" in data
          ? String((data as { message: unknown }).message)
          : "Request failed";
    throw new Error(message);
  }

  return data;
}
