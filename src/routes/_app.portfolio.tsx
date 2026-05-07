/* eslint-disable prettier/prettier */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, getDisplayName } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Award, Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/portfolio")({
  component: PortfolioPage,
  head: () => ({ meta: [{ title: "Portfolio — Augusta Victoria Hospital" }] }),
});

// Fix #4 — removed fake email field (not in profiles table) and fake location
// Only full_name, phone, bio (localStorage only — no DB column) are editable
interface LocalProfile {
  specialty: string;
  bio: string;
  location: string;
}

function PortfolioPage() {
  const { t, lang } = useI18n();
  const { user, refreshProfile } = useAuth();
  const storageKey = `avh.profile.${user?.id ?? "x"}`;

  const defaultLocal: LocalProfile = {
    specialty:
      user?.role === "doctor" ? (lang === "ar" ? "أورام طبية" : "Medical Oncology")
        : user?.role === "nurse" ? (lang === "ar" ? "تمريض الأورام" : "Oncology Nursing")
          : user?.role === "patient" ? (lang === "ar" ? "مريض/ة" : "Patient")
            : (lang === "ar" ? "مرافق" : "Escort"),
    bio: lang === "ar"
      ? "عضو في مجتمع مستشفى المطلع، نسعى لتقديم رعاية إنسانية متميزة لمرضى الأورام."
      : "A member of the Augusta Victoria community, dedicated to compassionate cancer care.",
    location: lang === "ar" ? "القدس، جبل الزيتون" : "Jerusalem, Mount of Olives",
  };

  // Fields that exist in the DB profiles table
  const [fullName, setFullName] = useState(user ? getDisplayName(user, lang) : "");
  const [phone, setPhone] = useState(user?.profile?.phone ?? "");

  // Fields stored locally only (no DB column)
  const [local, setLocal] = useState<LocalProfile>(defaultLocal);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setLocal(JSON.parse(raw));
    } catch { /* empty */ }
  }, [storageKey]);

  useEffect(() => {
    if (user) {
      setFullName(getDisplayName(user, lang));
      setPhone(user.profile?.phone ?? "");
    }
  }, [user, lang]);

  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Fix #7 — save DB fields (full_name, phone) to Supabase
      await updateProfile(user.id, {
        full_name: fullName.trim() || getDisplayName(user, lang),
        phone: phone.trim() || undefined,
      });
      // Save local-only fields to localStorage
      localStorage.setItem(storageKey, JSON.stringify(local));
      // Refresh auth context so header shows updated name
      await refreshProfile();
      toast.success(t("saved"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6">
      {/* Profile card */}
      <Card className="p-6 shadow-soft h-fit text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-hero text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-elevated">
          {fullName.charAt(0)}
        </div>
        <h2 className="mt-4 text-xl font-bold">{fullName}</h2>
        <Badge variant="secondary" className="mt-2">{t(user.role)}</Badge>
        <p className="mt-3 text-sm text-primary font-medium">{local.specialty}</p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{local.bio}</p>

        <div className="mt-6 space-y-2 text-left">
          {phone && <Row icon={Phone} value={phone} />}
          <Row icon={MapPin} value={local.location} />
          <Row icon={Award} value={`ID #${user.profile?.id_number ?? user.id.slice(0, 8)}`} />
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-lg mb-5">{t("settings")}</h3>
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
          <Field
            label={t("name")}
            value={fullName}
            onChange={setFullName}
          />
          <Field
            label={t("specialty")}
            value={local.specialty}
            onChange={(v) => setLocal({ ...local, specialty: v })}
          />
          <Field
            label={t("phone")}
            value={phone}
            onChange={setPhone}
          />
          <div className="sm:col-span-2">
            <Field
              label={lang === "ar" ? "الموقع" : "Location"}
              value={local.location}
              onChange={(v) => setLocal({ ...local, location: v })}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>{t("bio")}</Label>
            <Textarea rows={4} value={local.bio} onChange={(e) => setLocal({ ...local, bio: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {saving ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <span className="text-sm truncate">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}