/* eslint-disable prettier/prettier */

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeartPulse, Globe, Loader2, HeartHandshake, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create account — Augusta Victoria Hospital" },
      { name: "description", content: "Register as a patient or escort at Augusta Victoria Hospital." },
    ],
  }),
});

function RegisterPage() {
  const { t, lang, setLang, dir } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    role: "patient" as "patient" | "escort",
    full_name: "",
    id_number: "",
    phone: "",
    email: "",
    password: "",
    date_of_birth: "",
    gender: "male" as "male" | "female" | "other",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.full_name.trim().length < 2) return toast.error(t("fullName"));
    if (form.id_number.trim().length < 4) return toast.error(t("invalidId"));
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error(t("email"));
    if (form.password.length < 6) return toast.error(t("password") + " ≥ 6");

    setBusy(true);
    const { error } = await signUp({
      email: form.email.trim(),
      password: form.password,
      full_name: form.full_name.trim(),
      id_number: form.id_number.trim(),
      phone: form.phone.trim(),
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      role: form.role,
    });
    setBusy(false);
    if (error) return toast.error(error);
    toast.success(t("signupSuccess"));
    navigate({ to: "/dashboard" });
  };

  return (
    <div dir={dir} className="min-h-screen bg-soft py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm">Augusta Victoria</div>
              <div className="text-xs text-muted-foreground">{lang === "ar" ? "المطلع" : "Hospital"}</div>
            </div>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
            <Globe className="h-4 w-4 me-2" />
            {t("switchLang")}
          </Button>
        </div>

        <Card className="p-6 sm:p-8 shadow-elevated">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{t("register")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("registerSubtitle")}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>{t("role")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: "patient", icon: HeartHandshake },
                  { key: "escort", icon: Users },
                ] as const).map(({ key, icon: Icon }) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => set("role", key)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                      form.role === key
                        ? "border-primary bg-primary-soft text-primary font-semibold shadow-soft"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("fullName")} value={form.full_name} onChange={(v) => set("full_name", v)} />
              <Field label={t("idNumber")} value={form.id_number} onChange={(v) => set("id_number", v)} inputMode="numeric" />
              <Field label={t("email")} type="email" value={form.email} onChange={(v) => set("email", v)} />
              <Field label={t("phone")} value={form.phone} onChange={(v) => set("phone", v)} />
              <Field label={t("dob")} type="date" value={form.date_of_birth} onChange={(v) => set("date_of_birth", v)} />
              <div className="space-y-2">
                <Label>{t("gender")}</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v as typeof form.gender)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("male")}</SelectItem>
                    <SelectItem value="female">{t("female")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Field label={t("password")} type="password" value={form.password} onChange={(v) => set("password", v)} />
              </div>
            </div>

            <Button type="submit" disabled={busy} className="w-full h-11 text-base font-semibold">
              {busy && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t("register")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link to="/" className="text-primary font-semibold hover:underline">{t("login")}</Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", inputMode }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; inputMode?: "numeric" | "text";
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} className="h-11" />
    </div>
  );
}
