/* eslint-disable prettier/prettier */

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAppointments, createAppointment, cancelAppointment, type Appointment, type AppointmentType } from "@/lib/db";
import { Plus, Pill, Radiation, Stethoscope, HeartHandshake, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/appointments")({
  component: AppointmentsPage,
  head: () => ({ meta: [{ title: "Appointments — Augusta Victoria Hospital" }] }),
});

// Fix #2 — added physio icon mapping to match the DB type
const ICONS: Record<AppointmentType, typeof Pill> = {
  chemotherapy: Pill,
  radiation: Radiation,
  clinic: Stethoscope,
  physio: HeartHandshake,
  physioSession: HeartHandshake,
};

function AppointmentsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "clinic" as AppointmentType, date: "", time: "", doctor: "", room: "" });

  const reload = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listAppointments(user.id, user.role);
      setItems(data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); /* eslint-disable-next-line */ }, [user?.id]);

  const submit = async () => {
    if (!user) return;
    if (!form.date || !form.time || !form.doctor) {
      toast.error(lang === "ar" ? "يرجى تعبئة كل الحقول" : "Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment({
        patient_id: user.id,
        type: form.type,
        date: form.date,
        time: form.time,
        doctor: form.doctor,
        room: form.room || null,
      });
      setOpen(false);
      setForm({ type: "clinic", date: "", time: "", doctor: "", room: "" });
      toast.success(t("saved"));
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fix #6 — cancel appointment handler
  const handleCancel = async (id: string) => {
    const confirmed = window.confirm(
      lang === "ar" ? "هل أنت متأكد من إلغاء هذا الموعد؟" : "Are you sure you want to cancel this appointment?"
    );
    if (!confirmed) return;
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      toast.success(lang === "ar" ? "تم إلغاء الموعد" : "Appointment cancelled");
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = items.filter((i) => i.status !== "completed" && i.status !== "cancelled");
  const past = items.filter((i) => i.status === "completed" || i.status === "cancelled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("appointments")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("upcoming")} & {t("completed")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 me-2" />{t("bookNew")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("bookNew")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("type")}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AppointmentType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chemotherapy">{t("chemotherapy")}</SelectItem>
                    <SelectItem value="radiation">{t("radiation")}</SelectItem>
                    <SelectItem value="clinic">{t("clinic")}</SelectItem>
                    <SelectItem value="physio">{t("physio")}</SelectItem>
                    <SelectItem value="physioSession">{t("physioSession")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>{t("date")}</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t("time")}</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>{t("doctorCol")}</Label><Input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} placeholder="Dr. ..." /></div>
              <div className="space-y-2"><Label>{lang === "ar" ? "الغرفة" : "Room"}</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>{t("cancel")}</Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t("confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></Card>
      ) : (
        <>
          <Section
            title={t("upcoming")}
            list={upcoming}
            t={t}
            cancellingId={cancellingId}
            onCancel={handleCancel}
          />
          {past.length > 0 && (
            <Section
              title={t("completed")}
              list={past}
              t={t}
              muted
              cancellingId={cancellingId}
              onCancel={handleCancel}
            />
          )}
        </>
      )}
    </div>
  );
}

// Fix #16 — removed dead `lang` prop and hidden span
function Section({
  title,
  list,
  t,
  muted,
  cancellingId,
  onCancel,
}: {
  title: string;
  list: Appointment[];
  t: ReturnType<typeof useI18n>["t"];
  muted?: boolean;
  cancellingId: string | null;
  onCancel: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{title}</h3>
      <Card className="overflow-hidden shadow-soft">
        {list.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">{t("noAppointments")}</div>
        ) : (
          <div className="divide-y divide-border">
            {list.map((a) => {
              const Icon = ICONS[a.type] ?? HeartHandshake;
              const isCancellable = a.status === "scheduled" || a.status === "pending";
              return (
                <div key={a.id} className={`flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors ${muted ? "opacity-70" : ""}`}>
                  <div className="h-11 w-11 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{t(a.type as never)}</div>
                    <div className="text-xs text-muted-foreground">{a.doctor}{a.room ? ` · ${a.room}` : ""}</div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-semibold">{a.date}</div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </div>
                  <Badge variant={
                    a.status === "scheduled" ? "default" :
                      a.status === "completed" ? "secondary" :
                        a.status === "cancelled" ? "destructive" : "outline"
                  }>
                    {t(a.status)}
                  </Badge>
                  {/* Fix #6 — cancel button for active appointments */}
                  {isCancellable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => onCancel(a.id)}
                      disabled={cancellingId === a.id}
                      title={t("cancelAppt")}
                    >
                      {cancellingId === a.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <X className="h-4 w-4" />
                      }
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}