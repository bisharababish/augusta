import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, type Profile, type DbRole } from "./supabase";

export type Role = "patient" | "doctor" | "nurse" | "escort";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  profile: Profile | null;
}

interface SignUpInput {
  email: string;
  password: string;
  full_name: string;
  id_number: string;
  phone: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  role: "patient" | "escort"; // self-registration only allowed for these
}

interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

async function loadProfileAndRole(userId: string, email: string): Promise<AuthUser | null> {
  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
  ]);

  const role = (roleRow?.role as DbRole | undefined) ?? "patient";
  // Treat admin as doctor for UI routing fallback (admins also use the dashboard)
  const uiRole: Role = role === "admin" ? "doctor" : (role as Role);

  return {
    id: userId,
    email,
    role: uiRole,
    profile: (profile as Profile | null) ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Defer DB calls outside the callback
        setTimeout(async () => {
          const u = await loadProfileAndRole(session.user.id, session.user.email ?? "");
          setUser(u);
        }, 0);
      } else {
        setUser(null);
      }
    });

    // Then fetch existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await loadProfileAndRole(session.user.id, session.user.email ?? "");
        setUser(u);
      }
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthCtx["signUp"] = async (input) => {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: input.full_name,
          id_number: input.id_number,
          phone: input.phone,
          date_of_birth: input.date_of_birth,
          gender: input.gender,
          role: input.role,
        },
      },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Signup failed" };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const u = await loadProfileAndRole(user.id, user.email);
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function getDisplayName(user: AuthUser, _lang: "en" | "ar") {
  return user.profile?.full_name || user.email;
}
