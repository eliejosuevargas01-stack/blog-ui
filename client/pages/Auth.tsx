import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { translations, type Language } from "@/lib/i18n";
import { sendWebhook } from "@/lib/webhook";

interface AuthProps {
  lang: Language;
}

type AuthTab = "login" | "signup";

function extractWebhookMessage(payload: unknown): string | null {
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
}

export default function Auth({ lang }: AuthProps) {
  const t = translations[lang];
  const location = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<AuthTab>("login");
  const [loadingAction, setLoadingAction] = useState<AuthTab | null>(null);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const desiredTab = params.get("tab");
    if (desiredTab === "signup") {
      setTab("signup");
      return;
    }
    setTab("login");
  }, [location.search]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingAction("login");
    try {
      const response = await sendWebhook({
        action: "login",
        email: loginData.email,
        password: loginData.password,
        lang,
      });
      const responseMessage = extractWebhookMessage(response);
      const isError = responseMessage
        ? responseMessage.toLowerCase().includes("incorrect")
        : false;
      toast({
        title: isError ? t.auth.errorTitle : t.auth.loginSuccessTitle,
        description: responseMessage ?? t.auth.loginSuccessDescription,
        variant: isError ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: t.auth.errorTitle,
        description:
          error instanceof Error ? error.message : t.auth.errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingAction("signup");
    try {
      await sendWebhook({
        action: "singin",
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        lang,
      });
      toast({
        title: t.auth.signupSuccessTitle,
        description: t.auth.signupSuccessDescription,
      });
    } catch (error) {
      toast({
        title: t.auth.errorTitle,
        description:
          error instanceof Error ? error.message : t.auth.errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="auth"
        title={t.meta.auth.title}
        description={t.meta.auth.description}
      />
      <Header lang={lang} pageKey="auth" t={t} />

      <main className="flex-1">
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                {t.auth.title}
              </h1>
              <p className="text-lg text-foreground/60">
                {t.auth.subtitle}
              </p>
            </div>

            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>{t.auth.title}</CardTitle>
                <CardDescription>{t.auth.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={(value) => setTab(value as AuthTab)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t.auth.loginTab}</TabsTrigger>
                    <TabsTrigger value="signup">{t.auth.signupTab}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form className="space-y-4" onSubmit={handleLoginSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="login-email">{t.auth.emailLabel}</Label>
                        <Input
                          id="login-email"
                          type="email"
                          autoComplete="email"
                          value={loginData.email}
                          onChange={(event) =>
                            setLoginData((prev) => ({
                              ...prev,
                              email: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">
                          {t.auth.passwordLabel}
                        </Label>
                        <Input
                          id="login-password"
                          type="password"
                          autoComplete="current-password"
                          value={loginData.password}
                          onChange={(event) =>
                            setLoginData((prev) => ({
                              ...prev,
                              password: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <p className="text-sm text-foreground/60">
                        {t.auth.loginHint}
                      </p>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loadingAction === "login"}
                      >
                        {loadingAction === "login"
                          ? `${t.auth.loginButton}...`
                          : t.auth.loginButton}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form className="space-y-4" onSubmit={handleSignupSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">{t.auth.nameLabel}</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          autoComplete="name"
                          value={signupData.name}
                          onChange={(event) =>
                            setSignupData((prev) => ({
                              ...prev,
                              name: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">{t.auth.emailLabel}</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          autoComplete="email"
                          value={signupData.email}
                          onChange={(event) =>
                            setSignupData((prev) => ({
                              ...prev,
                              email: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">
                          {t.auth.passwordLabel}
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          autoComplete="new-password"
                          value={signupData.password}
                          onChange={(event) =>
                            setSignupData((prev) => ({
                              ...prev,
                              password: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <p className="text-sm text-foreground/60">
                        {t.auth.signupHint}
                      </p>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loadingAction === "signup"}
                      >
                        {loadingAction === "signup"
                          ? `${t.auth.signupButton}...`
                          : t.auth.signupButton}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
