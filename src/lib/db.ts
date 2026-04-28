import { supabase } from "./supabase";

export type AppointmentType = "chemotherapy" | "radiation" | "clinic" | "physioSession";
export type AppointmentStatus = "scheduled" | "completed" | "pending";

export interface Appointment {
  id: string;
  patient_id: string;
  type: AppointmentType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  doctor: string;
  room: string | null;
  status: AppointmentStatus;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author_id: string;
  author_name: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
}

// ---------- Appointments ----------
export async function listAppointments(userId: string, role: string): Promise<Appointment[]> {
  let q = supabase.from("appointments").select("*").order("date", { ascending: true }).order("time", { ascending: true });
  // Patients/escorts only see their own; staff see all
  if (role === "patient" || role === "escort") q = q.eq("patient_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function createAppointment(input: {
  patient_id: string;
  type: AppointmentType;
  date: string;
  time: string;
  doctor: string;
  room?: string | null;
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({ ...input, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data as Appointment;
}

// ---------- Announcements ----------
export async function listAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Announcement[];
}

export async function createAnnouncement(input: {
  title: string;
  body: string;
  author_id: string;
  author_name: string;
}): Promise<Announcement> {
  const { data, error } = await supabase.from("announcements").insert(input).select().single();
  if (error) throw error;
  return data as Announcement;
}

// ---------- Messages ----------
export async function listMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(input: { sender_id: string; recipient_id: string; body: string }): Promise<Message> {
  const { data, error } = await supabase.from("messages").insert(input).select().single();
  if (error) throw error;
  return data as Message;
}

// ---------- Staff lookup (for chat target) ----------
export interface StaffProfile {
  id: string;
  full_name: string;
  role: string;
}

export async function listStaff(): Promise<StaffProfile[]> {
  // user_roles joined with profiles
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role, profiles:profiles!inner(id, full_name)")
    .in("role", ["doctor", "nurse"]);
  if (error) throw error;
  type Row = { user_id: string; role: string; profiles: { id: string; full_name: string } | { id: string; full_name: string }[] };
  return ((data ?? []) as Row[]).map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return { id: r.user_id, full_name: p?.full_name ?? "Staff", role: r.role };
  });
}
