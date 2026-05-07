/* eslint-disable prettier/prettier */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, getDisplayName } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listAppointments, listAnnouncements, countUnreadMessages, type Appointment, type Announcement, type AppointmentType } from "@/lib/db";
import { CalendarDays, MessageCircle, Megaphone, HeartHandshake, ArrowRight, Activity, Pill, Radiation, Stethoscope, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Augusta Victoria Hospital" }] }),
});

const ICONS: Record<AppointmentType, typeof Pill> = {
  chemotherapy: Pill,
  radiation: Radiation,
  clinic: Stethoscope,
  physio: HeartHandshake,
  physioSession: HeartHandshake,
};

function Dashboard() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [anns, setAnns] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0); // Fix #9
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        // Fix #9 — fetch real unread count in parallel
        const [a, n, unread] = await Promise.all([
          listAppointments(user.id, user.role),
          listAnnouncements(),
          countUnreadMessages(user.id),
        ]);
        if (!alive) return;
        setAppts(a);
        setAnns(n);
        setUnreadCount(unread);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  if (!user) return null;

  const upcoming = appts.filter((a) => a.status !== "completed" && a.status !== "cancelled").slice(0, 3);
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = appts.filter((a) => a.date === today).length;

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 bg-hero text-primary-foreground border-0 shadow-elevated overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="text-sm opacity-80">{t("welcome")},</div>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1">{getDisplayName(user, lang)}</h2>
          <p className="opacity-90 mt-2 max-w-xl">{t("tagline")}</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label={t("upcoming")} value={upcoming.length.toString()} tone="primary" />
        <StatCard icon={Activity} label={t("todayAppointments")} value={todayCount.toString()} tone="success" />
        {/* Fix #9 — real unread count */}
        <StatCard icon={MessageCircle} label={t("unreadMessages")} value={unreadCount.toString()} tone="warning" />
        <StatCard icon={Megaphone} label={t("newAnnouncements")} value={anns.length.toString()} tone="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-lg">{t("upcoming")}</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/appointments">{t("viewSchedule")} <ArrowRight className="h-4 w-4 ms-1" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-6 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">{t("noAppointments")}</div>
            ) : upcoming.map((a) => {
              const Icon = ICONS[a.type] ?? HeartHandshake;
              return (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary-soft/40 transition-all">
                  <div className="h-11 w-11 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{t(a.type as never)}</div>
                    <div className="text-xs text-muted-foreground">{a.doctor}{a.room ? ` · ${a.room}` : ""}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold">{a.date}</div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <h3 className="font-semibold text-lg mb-5">{t("quickActions")}</h3>
          <div className="space-y-2">
            <QuickLink to="/physio" icon={HeartHandshake} label={t("bookSession")} />
            <QuickLink to="/chat" icon={MessageCircle} label={t("talkToSomeone")} />
            <QuickLink to="/appointments" icon={CalendarDays} label={t("viewSchedule")} />
            <QuickLink to="/announcements" icon={Megaphone} label={t("postAnnouncement")} />
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">{t("announcements")}</h3>
          <Button asChild variant="ghost" size="sm"><Link to="/announcements">{t("details")} <ArrowRight className="h-4 w-4 ms-1" /></Link></Button>
        </div>
        {loading ? (
          <div className="text-center py-6 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
        ) : anns.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">—</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {anns.slice(0, 2).map((n) => (
              <div key={n.id} className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="text-xs text-primary font-semibold mb-1">{n.created_at.slice(0, 10)}</div>
                <div className="font-semibold mb-1">{n.title}</div>
                <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof CalendarDays; label: string; value: string; tone: "primary" | "success" | "warning" }) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    success: "bg-[oklch(0.94_0.06_155)] text-[oklch(0.45_0.15_155)]",
    warning: "bg-[oklch(0.96_0.08_75)] text-[oklch(0.50_0.15_75)]",
  }[tone];
  return (
    <Card className="p-5 shadow-soft border-border/60">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </Card>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: "/physio" | "/chat" | "/appointments" | "/announcements"; icon: typeof CalendarDays; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-soft transition-colors group">
      <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium flex-1">{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary rtl:rotate-180" />
    </Link>
  );
}