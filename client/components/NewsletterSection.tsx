import { useState, type FormEvent } from "react";

import { useToast } from "@/hooks/use-toast";
import type { Translation } from "@/lib/i18n";
import { sendWebhook } from "@/lib/webhook";

interface NewsletterSectionProps {
  t: Translation;
}

export function NewsletterSection({ t }: NewsletterSectionProps) {
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) {
      return;
    }
    setNewsletterLoading(true);
    try {
      await sendWebhook({
        action: "new_subscriptor",
        email,
      });
      toast({
        title: t.newsletter.successTitle,
        description: t.newsletter.successDescription,
      });
      setNewsletterEmail("");
    } catch (error) {
      toast({
        title: t.newsletter.errorTitle,
        description:
          error instanceof Error ? error.message : t.newsletter.errorDescription,
        variant: "destructive",
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <section
      id="newsletter"
      className="scroll-mt-24 py-20 sm:py-32 border-b border-border bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
            {t.newsletter.title}
          </h2>
          <p className="text-xl text-foreground/60 mb-8">
            {t.newsletter.subtitle}
          </p>

          <form
            className="flex flex-col sm:flex-row gap-4"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              placeholder={t.newsletter.placeholder}
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              autoComplete="email"
              required
              className="flex-1 px-6 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-secondary/20 transition-all hover:scale-105 whitespace-nowrap disabled:opacity-70 disabled:hover:shadow-none disabled:hover:scale-100"
              disabled={newsletterLoading}
            >
              {newsletterLoading
                ? `${t.newsletter.button}...`
                : t.newsletter.button}
            </button>
          </form>

          <p className="text-xs text-foreground/50 mt-4">
            {t.newsletter.note}
          </p>
        </div>
      </div>
    </section>
  );
}
