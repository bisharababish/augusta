/* eslint-disable prettier/prettier */

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import logo from "@/assets/LOGO.jpeg";
import { Globe, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Augusta Victoria Hospital" },
      { name: "description", content: "Sign in to Augusta Victoria Hospital portal." },
    ],
  }),
});

function LoginPage() {
  const { t, lang, setLang, dir } = useI18n();
  const { signIn, user, ready } = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard" });
  }, [ready, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId.trim().length < 4 || password.length < 6) {
      toast.error(t("loginFailed"));
      return;
    }
    setBusy(true);
    const { error } = await signIn(loginId.trim(), password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div dir={dir} className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Hero side */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 bg-muted text-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${logo})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "72%",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div>
              <div className="font-bold text-lg leading-tight">Augusta Victoria Hospital</div>
              <div className="text-sm opacity-70">مستشفى المطلع</div>
            </div>
          </div>
        </div>
        <div className="relative space-y-6 max-w-md mt-26">
          <h1 className="text-4xl font-bold leading-tight">{t("welcome")}</h1>
          <p className="text-lg opacity-80">{t("tagline")}</p>
        </div>
        <div className="relative flex items-center gap-2 text-sm opacity-70">
          <ShieldCheck className="h-4 w-4" />
          <span>
            {lang === "ar"
              ? "بوابة آمنة لمستشفى المطلع"
              : "Secure portal — Augusta Victoria"}
          </span>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <img src={logo} alt="Augusta Victoria Hospital logo" className="h-12 w-auto object-contain" />
            <span className="font-semibold">Augusta Victoria</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
            <Globe className="h-4 w-4 me-2" />
            {t("switchLang")}
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md p-8 shadow-elevated border-border/60">
            <div className="space-y-1 mb-6">
              <h2 className="text-2xl font-bold">{t("login")}</h2>
              <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-id">{t("idNumber")}</Label>
                <Input
                  id="login-id"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder={t("enterId")}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t("enterPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full h-11 text-base font-semibold"
              >
                {busy && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t("loginCta")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                {t("register")}
              </Link>
            </p>

            <p className="mt-3 text-center text-xs text-muted-foreground">{t("staffNote")}</p>

            <a
              href="https://avh.org/ar"
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {t("searchHospital")} — avh.org
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}