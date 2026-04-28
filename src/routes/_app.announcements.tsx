import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, getDisplayName } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { listAnnouncements, createAnnouncement, type Announcement } from "@/lib/db";
import { Megaphone, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/announcements")({
  component: AnnouncementsPage,
  head: () => ({ meta: [{ title: "Announcements — Augusta Victoria Hospital" }] }),
});

function AnnouncementsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const canPost = user?.role === "doctor" || user?.role === "nurse";

  const reload = async () => {
    setLoading(true);
    try { setItems(await listAnnouncements()); } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { void reload(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || !form.body.trim()) {
      toast.error(lang === "ar" ? "يرجى تعبئة الكل" : "Fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await createAnnouncement({
        title: form.title.trim(),
        body: form.body.trim(),
        author_id: user.id,
        author_name: getDisplayName(user, "en"),
      });
      setForm({ title: "", body: "" });
      toast.success(t("saved"));
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></Card>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center text-sm text-muted-foreground">—</Card>
        ) : items.map((n) => (
          <Card key={n.id} className="p-5 shadow-soft hover:shadow-elevated transition-shadow">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span>{n.created_at.slice(0, 10)}</span>
                  <span>·</span>
                  <span>{t("by")} <span className="text-primary font-medium">{n.author_name}</span></span>
                </div>
                <h3 className="font-semibold text-lg">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{n.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {canPost && (
        <Card className="p-6 shadow-soft h-fit lg:sticky lg:top-20">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t("postAnnouncement")}</h3>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>{t("title")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{t("body")}</Label><Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t("publish")}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
