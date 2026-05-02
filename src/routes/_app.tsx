/* eslint-disable prettier/prettier */

import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, getDisplayName } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, CalendarDays, MessageCircle, HeartHandshake, Megaphone, UserCircle2,
  BarChart3, LogOut, Globe, HeartPulse, Menu,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { to: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { to: "/appointments", labelKey: "appointments", icon: CalendarDays },
  { to: "/chat", labelKey: "chat", icon: MessageCircle },
  { to: "/physio", labelKey: "physio", icon: HeartHandshake },
  { to: "/announcements", labelKey: "announcements", icon: Megaphone },
  { to: "/portfolio", labelKey: "portfolio", icon: UserCircle2 },
  { to: "/reports", labelKey: "reports", icon: BarChart3 },
] as const;

function AppLayout() {
  const { t, lang, setLang, dir } = useI18n();
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/" });
  }, [ready, user, navigate]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (!ready || !user) return null;

  const handleLogout = async () => { await signOut(); navigate({ to: "/" }); };

  return (
    <div dir={dir} className="min-h-screen flex bg-soft">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform ${open ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full"} lg:translate-x-0 ${dir === "rtl" ? "right-0" : "left-0"}`}>
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm">Augusta Victoria</div>
              <div className="text-xs opacity-70">{lang === "ar" ? "المطلع" : "Hospital"}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(({ to, labelKey, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-soft"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/90"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t(labelKey as never)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="h-9 w-9 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-sm font-bold">
              {getDisplayName(user, lang).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{getDisplayName(user, lang)}</div>
              <div className="text-xs opacity-70 truncate">{t(user.role)} · #{user.id}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 me-2" />
            {t("logout")}
          </Button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-background/80 backdrop-blur border-b border-border px-4 sm:px-6 h-14">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-base sm:text-lg">
              {t((NAV.find(n => n.to === location.pathname)?.labelKey ?? "dashboard") as never)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>
              <Globe className="h-4 w-4 me-2" />
              {t("switchLang")}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
