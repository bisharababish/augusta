import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listAppointments, type Appointment, type AppointmentType } from "@/lib/db";
import { Download, TrendingUp, Pill, Radiation, Stethoscope, HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports — Augusta Victoria Hospital" }] }),
});

function ReportsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try { setAppts(await listAppointments(user.id, user.role)); }
      catch (e) { toast.error((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const counts = appts.reduce<Record<string, number>>((acc, a) => { acc[a.type] = (acc[a.type] ?? 0) + 1; return acc; }, {});
  const total = appts.length;
  const completed = appts.filter((a) => a.status === "completed").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const breakdown: { key: AppointmentType; icon: typeof Pill; count: number }[] = [
    { key: "chemotherapy", icon: Pill, count: counts.chemotherapy ?? 0 },
    { key: "radiation", icon: Radiation, count: counts.radiation ?? 0 },
    { key: "clinic", icon: Stethoscope, count: counts.clinic ?? 0 },
    { key: "physioSession", icon: HeartHandshake, count: counts.physioSession ?? 0 },
  ];
  const max = Math.max(...breakdown.map((b) => b.count), 1);

  const download = () => {
    const header = "type,date,time,doctor,room,status\n";
    const rows = appts.map((a) => `${a.type},${a.date},${a.time},"${a.doctor}","${a.room ?? ""}",${a.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "avh-report.csv"; link.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "ar" ? "تم تنزيل التقرير" : "Report downloaded");
  };

  if (loading) {
    return <Card className="p-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">{t("weeklyReport")}</div>
          <div className="text-3xl font-bold mt-1">{total}</div>
          <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "إجمالي المواعيد" : "Total appointments"}</div>
        </Card>
        <Card className="p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">{t("completed")}</div>
          <div className="text-3xl font-bold mt-1">{completed}</div>
          <div className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {completionRate}%</div>
        </Card>
        <Card className="p-5 shadow-soft bg-primary-soft border-primary/20">
          <div className="text-xs text-primary font-semibold">{t("download")}</div>
          <p className="text-sm text-muted-foreground mt-1 mb-3">CSV export</p>
          <Button onClick={download} size="sm" className="w-full" disabled={total === 0}><Download className="h-4 w-4 me-2" />CSV</Button>
        </Card>
      </div>

      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-lg mb-5">{lang === "ar" ? "توزيع العلاجات" : "Treatment breakdown"}</h3>
        <div className="space-y-4">
          {breakdown.map((b) => (
            <div key={b.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <b.icon className="h-4 w-4 text-primary" /> {t(b.key)}
                </div>
                <span className="text-sm text-muted-foreground">{b.count}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-hero rounded-full transition-all" style={{ width: `${(b.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 shadow-soft">
        <h3 className="font-semibold text-lg mb-4">{t("monthlyReport")}</h3>
        {appts.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">{t("noAppointments")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pe-4 font-medium">{t("type")}</th>
                  <th className="py-2 pe-4 font-medium">{t("date")}</th>
                  <th className="py-2 pe-4 font-medium hidden sm:table-cell">{t("doctorCol")}</th>
                  <th className="py-2 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appts.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/40">
                    <td className="py-3 pe-4">{t(a.type)}</td>
                    <td className="py-3 pe-4 text-muted-foreground">{a.date} · {a.time}</td>
                    <td className="py-3 pe-4 text-muted-foreground hidden sm:table-cell">{a.doctor}</td>
                    <td className="py-3">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                        a.status === "completed" ? "bg-success/15 text-success" :
                        a.status === "scheduled" ? "bg-primary-soft text-primary" :
                        "bg-warning/15 text-[oklch(0.50_0.15_75)]"
                      }`}>{t(a.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
