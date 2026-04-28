import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HeartHandshake, Phone, MessageCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/physio")({
  component: PhysioPage,
  head: () => ({ meta: [{ title: "Physiotherapy & Support — Augusta Victoria Hospital" }] }),
});

const SERVICES = [
  { icon: HeartHandshake, key: "physio" as const, descEn: "Personalized rehabilitation programs to regain strength and mobility.", descAr: "برامج تأهيل شخصية لاستعادة القوة والحركة." },
  { icon: MessageCircle, key: "talk" as const, descEn: "One-on-one counseling — talk to a trained psychologist confidentially.", descAr: "جلسات فردية — تحدث مع أخصائي نفسي بسرية تامة." },
  { icon: Phone, key: "call" as const, descEn: "24/7 support hotline for patients and their families.", descAr: "خط دعم 24/7 للمرضى وذويهم." },
];

const LABEL: Record<"physio" | "talk" | "call", { en: string; ar: string }> = {
  physio: { en: "Physiotherapy", ar: "علاج طبيعي" },
  talk: { en: "Counseling session", ar: "جلسة استشارة" },
  call: { en: "Support hotline", ar: "خط الدعم" },
};

function PhysioPage() {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error(lang === "ar" ? "يرجى تعبئة الاسم والهاتف" : "Name and phone required"); return; }
    setSent(true);
    toast.success(lang === "ar" ? "تم إرسال طلبك. سنتواصل معك قريباً." : "Request sent. We'll be in touch soon.");
    setForm({ name: "", phone: "", note: "" });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 bg-hero text-primary-foreground border-0 shadow-elevated">
        <h2 className="text-2xl font-bold">{t("needSupport")}</h2>
        <p className="opacity-90 mt-2 max-w-2xl">{t("needSupportDesc")}</p>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {SERVICES.map(s => (
          <Card key={s.key} className="p-5 shadow-soft hover:shadow-elevated transition-shadow">
            <div className="h-11 w-11 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1">{LABEL[s.key][lang]}</h3>
            <p className="text-sm text-muted-foreground">{lang === "ar" ? s.descAr : s.descEn}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t("requestCall")}</h3>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>{t("name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{t("contact")}</Label><Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+962 ..." /></div>
            <div className="space-y-2"><Label>{lang === "ar" ? "ملاحظات" : "Notes"}</Label><Textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            <Button type="submit" className="w-full">{t("requestCall")}</Button>
            {sent && <p className="text-xs text-success text-center">{t("saved")}</p>}
          </form>
        </Card>

        <Card className="p-6 shadow-soft bg-primary-soft border-primary/20">
          <h3 className="font-semibold mb-3">{lang === "ar" ? "خطوط الدعم المباشرة" : "Direct support lines"}</h3>
          <div className="space-y-3">
            <ContactRow icon={Phone} label={lang === "ar" ? "خط الدعم النفسي" : "Psychological support"} value="+970 2 627 9911" />
            <ContactRow icon={Phone} label={lang === "ar" ? "العلاج الطبيعي" : "Physiotherapy"} value="+970 2 627 9912" />
            <ContactRow icon={Phone} label={lang === "ar" ? "الطوارئ" : "Emergency"} value="+970 2 627 9900" />
          </div>
          <a href="https://avh.org/ar" target="_blank" rel="noreferrer" className="block mt-5 text-xs text-primary hover:underline">avh.org</a>
        </Card>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
      <Icon className="h-4 w-4 text-primary" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold text-sm">{value}</div>
      </div>
    </div>
  );
}
