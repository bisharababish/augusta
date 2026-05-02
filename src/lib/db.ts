/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from "./supabase";

export type AppointmentType = "chemotherapy" | "radiation" | "clinic" | "physioSession";
export type AppointmentStatus = "scheduled" | "completed" | "pending" | "cancelled";

export interface Appointment {
    id: string;
    patient_id: string;
    type: AppointmentType;
    date: string;
    time: string;
    doctor: string | null;
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
  receiver_id?: string;
  body: string;
  created_at: string;
}

export interface StaffProfile {
    id: string;
    full_name: string;
    role: string;
}

// ── Appointments ──────────────────────────────────────────────────────────────

export async function listAppointments(userId: string, role: string): Promise<Appointment[]> {
    let q = supabase
        .from("appointments")
        .select("id, patient_id, type, date, time, doctor, room, status, created_at")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

    if (role === "patient" || role === "escort") {
        q = q.eq("patient_id", userId);
    }

    const { data, error } = await q;
    if (error) throw new Error(error.message);

    return (data ?? []).map((row: any) => ({
        id: row.id,
        patient_id: row.patient_id,
        type: row.type,
        date: row.date ? String(row.date) : "",
        time: row.time ? String(row.time).slice(0, 5) : "",
        doctor: row.doctor ?? null,
        room: row.room ?? null,
        status: row.status,
        created_at: row.created_at,
    }));
}

export async function createAppointment(input: {
    patient_id: string;
    type: AppointmentType;
    date: string;
    time: string;
    doctor: string;
    room?: string | null;
}): Promise<Appointment> {
    const scheduled_at = new Date(`${input.date}T${input.time}:00`).toISOString();

    const { data, error } = await supabase
        .from("appointments")
        .insert({ ...input, status: "pending", scheduled_at })
        .select("id, patient_id, type, date, time, doctor, room, status, created_at")
        .single();
    if (error) throw new Error(error.message);

    const row: any = data;
    return {
        id: row.id,
        patient_id: row.patient_id,
        type: row.type,
        date: row.date ? String(row.date) : "",
        time: row.time ? String(row.time).slice(0, 5) : "",
        doctor: row.doctor ?? null,
        room: row.room ?? null,
        status: row.status,
        created_at: row.created_at,
    };
}

// ── Announcements ─────────────────────────────────────────────────────────────

export async function listAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
        .from("announcements")
        .select("id, title, body, author_id, created_at, profiles!announcements_author_id_profiles_fkey(full_name)")
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        author_id: row.author_id,
        created_at: row.created_at,
        author_name: row.profiles?.full_name ?? "Staff",
    }));
}
export async function listPatients(): Promise<StaffProfile[]> {
    const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, profiles!user_roles_user_id_profiles_fkey(id, full_name)")
        .eq("role", "patient");

    if (error) throw new Error(error.message);

    // Filter out anyone who is ALSO a doctor/nurse/admin in JS
    const { data: staffData } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["doctor", "nurse", "admin"]);

    const staffSet = new Set((staffData ?? []).map((r: any) => r.user_id as string));

    return (data ?? [])
        .filter((row: any) => !staffSet.has(row.user_id))
        .map((row: any) => {
            const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            return {
                id: row.user_id,
                full_name: p?.full_name ?? "Patient",
                role: row.role,
            };
        });
}
export async function createAnnouncement(input: {
    title: string;
    body: string;
    author_id: string;
}): Promise<Announcement> {
    const { data, error } = await supabase
        .from("announcements")
        .insert(input)
        .select("id, title, body, author_id, created_at, profiles!announcements_author_id_profiles_fkey(full_name)")
        .single();
    if (error) throw new Error(error.message);

    const row: any = data;
    return {
        id: row.id,
        title: row.title,
        body: row.body,
        author_id: row.author_id,
        created_at: row.created_at,
        author_name: row.profiles?.full_name ?? "Staff",
    };
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function listMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, recipient_id, body, created_at")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    return (data ?? []).map((row: any) => ({
        id: row.id,
        sender_id: row.sender_id,
        recipient_id: row.recipient_id,
        body: row.body,
        created_at: row.created_at,
    }));
}

export async function sendMessage(input: {
    sender_id: string;
    recipient_id: string;
    body: string;
}): Promise<Message> {
    const { data, error } = await supabase
        .from("messages")
        .insert(input)
        .select("id, sender_id, recipient_id, body, created_at")
        .single();
    if (error) throw new Error(error.message);

    const row: any = data;
    return {
        id: row.id,
        sender_id: row.sender_id,
        recipient_id: row.recipient_id,
        body: row.body,
        created_at: row.created_at,
    };
}

// ── Staff lookup ──────────────────────────────────────────────────────────────

export async function listStaff(): Promise<StaffProfile[]> {
    const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, profiles!user_roles_user_id_profiles_fkey(id, full_name)")
        .in("role", ["doctor", "nurse"]);
    if (error) throw new Error(error.message);

    return (data ?? []).map((row: any) => {
        const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
            id: row.user_id,
            full_name: p?.full_name ?? "Staff",
            role: row.role,
        };
    });
}