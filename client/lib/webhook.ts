import type { Language } from "@/lib/i18n";

export const WEBHOOK_URL =
  "https://myn8n.seommerce.shop/webhook/seommerce_blog";

export type WebhookAction = "login" | "singin" | "get_posts";

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
