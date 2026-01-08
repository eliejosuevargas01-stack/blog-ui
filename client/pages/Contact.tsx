import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

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
import { Textarea } from "@/components/ui/textarea";
import { buildPath, translations, type Language } from "@/lib/i18n";

interface ContactProps {
  lang: Language;
}

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function Contact({ lang }: ContactProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");
  const [formData, setFormData] = useState<ContactFormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = formData.subject.trim() || t.contact.form.defaultSubject;
    const messageLines = [
      `${t.contact.form.nameLabel}: ${formData.name || "-"}`,
      `${t.contact.form.emailLabel}: ${formData.email || "-"}`,
      "",
      formData.message,
    ];
    const body = encodeURIComponent(messageLines.join("\n"));
    const mailto = `mailto:${t.contact.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${body}`;

    if (typeof window !== "undefined") {
      window.location.href = mailto;
    }
  };

  const noteText = t.contact.form.note.replace("{email}", t.contact.email);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="contact"
        title={t.meta.contact.title}
        description={t.meta.contact.description}
      />
      <Header lang={lang} pageKey="contact" t={t} />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/10 via-background to-background py-16 sm:py-24">
          <div className="absolute inset-0">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <Link
                to={homePath}
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                {t.nav.home}
              </Link>
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mt-6 mb-4">
                {t.contact.title}
              </h1>
              <p className="text-lg sm:text-xl text-foreground/80">
                {t.contact.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>{t.contact.form.submitLabel}</CardTitle>
                  <CardDescription>{t.contact.intro}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">
                        {t.contact.form.nameLabel}
                      </Label>
                      <Input
                        id="contact-name"
                        value={formData.name}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">
                        {t.contact.form.emailLabel}
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-subject">
                        {t.contact.form.subjectLabel}
                      </Label>
                      <Input
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            subject: event.target.value,
                          }))
                        }
                        placeholder={t.contact.form.defaultSubject}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message">
                        {t.contact.form.messageLabel}
                      </Label>
                      <Textarea
                        id="contact-message"
                        value={formData.message}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            message: event.target.value,
                          }))
                        }
                        rows={6}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Button type="submit" className="w-full">
                        {t.contact.form.submitLabel}
                      </Button>
                      <p className="text-xs text-foreground/80">{noteText}</p>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>{t.contact.details.title}</CardTitle>
                  <CardDescription>{t.contact.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {t.contact.details.items.map((item) => {
                    const isEmail = item.value.includes("@");
                    return (
                      <div key={item.label} className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-foreground/50">
                          {item.label}
                        </p>
                        {isEmail ? (
                          <a
                            href={`mailto:${item.value}`}
                            className="text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-foreground/80">{item.value}</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
