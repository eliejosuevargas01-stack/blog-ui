import { useState, type FormEvent } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { buildPath, translations, type Language } from "@/lib/i18n";
import { sendWebhook } from "@/lib/webhook";

interface VerifyEmailProps {
  lang: Language;
}

const PURPOSE = "email_verification";

const extractWebhookMessage = (payload: unknown): string | null => {
  if (typeof payload === "string") {
    return payload;
  }
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0];
    if (typeof first === "string") {
      return first;
    }
    if (first && typeof first === "object" && "message" in first) {
      return String((first as { message: unknown }).message);
    }
  }
  if (payload && typeof payload === "object" && "message" in payload) {
    return String((payload as { message: unknown }).message);
  }
  return null;
};

export default function VerifyEmail({ lang }: VerifyEmailProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    verificationCode: "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await sendWebhook({
        action: "email_verification",
        user_id: formData.userId.trim(),
        verification_code: formData.verificationCode.trim(),
        purpose: PURPOSE,
      });
      const responseMessage = extractWebhookMessage(response);
      toast({
        title: t.verifyEmail.successTitle,
        description: responseMessage ?? t.verifyEmail.successDescription,
      });
      setFormData({ userId: "", verificationCode: "" });
    } catch (error) {
      toast({
        title: t.verifyEmail.errorTitle,
        description:
          error instanceof Error
            ? error.message
            : t.verifyEmail.errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="verifyEmail"
        title={t.meta.verifyEmail.title}
        description={t.meta.verifyEmail.description}
      />
      <Header lang={lang} pageKey="verifyEmail" t={t} />

      <main className="flex-1">
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                {t.verifyEmail.title}
              </h1>
              <p className="text-lg text-foreground/60">
                {t.verifyEmail.subtitle}
              </p>
            </div>

            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>{t.verifyEmail.title}</CardTitle>
                <CardDescription>{t.verifyEmail.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="verify-user-id">
                      {t.verifyEmail.userIdLabel}
                    </Label>
                    <Input
                      id="verify-user-id"
                      value={formData.userId}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          userId: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verify-code">
                      {t.verifyEmail.codeLabel}
                    </Label>
                    <Input
                      id="verify-code"
                      value={formData.verificationCode}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          verificationCode: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <p className="text-sm text-foreground/60">
                    {t.verifyEmail.hint}
                  </p>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading
                      ? `${t.verifyEmail.button}...`
                      : t.verifyEmail.button}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      window.location.href = homePath;
                    }}
                  >
                    {t.post.backToHome}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
