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
import { Mail, Phone, MapPin, Award } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/portfolio")({
  component: PortfolioPage,
  head: () => ({ meta: [{ title: "Portfolio — Augusta Victoria Hospital" }] }),
});

interface Profile {
  name: string;
  specialty: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
}

function PortfolioPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const storageKey = `avh.profile.${user?.id ?? "x"}`;

  const defaults: Profile = {
    name: user ? getDisplayName(user, lang) : "",
    specialty: user?.role === "doctor" ? (lang === "ar" ? "أورام طبية" : "Medical Oncology")
      : user?.role === "nurse" ? (lang === "ar" ? "تمريض الأورام" : "Oncology Nursing")
      : user?.role === "patient" ? (lang === "ar" ? "مريض/ة" : "Patient")
      : (lang === "ar" ? "مرافق" : "Escort"),
    bio: lang === "ar"
      ? "عضو في مجتمع مستشفى المطلع، نسعى لتقديم رعاية إنسانية متميزة لمرضى الأورام."
      : "A member of the Augusta Victoria community, dedicated to compassionate cancer care.",
    email: "user@avh.org",
    phone: "+970 2 627 9900",
    location: lang === "ar" ? "القدس، جبل الزيتون" : "Jerusalem, Mount of Olives",
  };

  const [profile, setProfile] = useState<Profile>(defaults);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(profile));
    toast.success(t("saved"));
  };

  if (!user) return null;

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6">
      {/* Profile card */}
      <Card className="p-6 shadow-soft h-fit text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-hero text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-elevated">
          {profile.name.charAt(0)}
        </div>
        <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
        <Badge variant="secondary" className="mt-2">{t(user.role)}</Badge>
        <p className="mt-3 text-sm text-primary font-medium">{profile.specialty}</p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>

        <div className="mt-6 space-y-2 text-left">
          <Row icon={Mail} value={profile.email} />
          <Row icon={Phone} value={profile.phone} />
          <Row icon={MapPin} value={profile.location} />
          <Row icon={Award} value={`ID #${user.profile?.id_number ?? user.id.slice(0, 8)}`} />
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-lg mb-5">{t("settings")}</h3>
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
          <Field label={t("name")} value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
          <Field label={t("specialty")} value={profile.specialty} onChange={(v) => setProfile({ ...profile, specialty: v })} />
          <Field label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} type="email" />
          <Field label={t("contact")} value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
          <div className="sm:col-span-2"><Field label={lang === "ar" ? "الموقع" : "Location"} value={profile.location} onChange={(v) => setProfile({ ...profile, location: v })} /></div>
          <div className="sm:col-span-2 space-y-2">
            <Label>{t("bio")}</Label>
            <Textarea rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </div>
          <div className="sm:col-span-2"><Button type="submit" className="w-full sm:w-auto">{t("save")}</Button></div>
        </form>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <span className="text-sm truncate">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
