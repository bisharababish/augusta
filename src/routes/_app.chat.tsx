/* eslint-disable prettier/prettier */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listMessages, sendMessage, listStaff, listPatients, type Message, type StaffProfile } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { Send, Stethoscope, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "Chat — Augusta Victoria Hospital" }] }),
});

function ChatPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<StaffProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const isStaff = user?.role === "doctor" || user?.role === "nurse" || user?.role === "admin";

  // Load contacts + messages
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [s, m] = await Promise.all([
          isStaff ? listPatients() : listStaff(),
          listMessages(user.id),
        ]);
        setContacts(s);
        setAllMessages(m);
        if (s.length > 0) setActiveId((prev) => prev ?? s[0].id);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Message;
          // Only add if it involves the current user
          // In realtime subscription
          if (msg.sender_id === user.id || msg.recipient_id === user.id || msg.receiver_id === user.id) {
            setAllMessages((prev) => {
              // Avoid duplicates
              if (prev.find((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const conversation = useMemo(() => {
    if (!user || !activeId) return [];
    // In conversation useMemo
    return allMessages.filter(
      (m) =>
        (m.sender_id === user.id && m.recipient_id === activeId) ||
        (m.sender_id === activeId && m.recipient_id === user.id) ||
        (m.sender_id === user.id && m.receiver_id === activeId) ||
        (m.sender_id === activeId && m.receiver_id === user.id)
    );
  }, [allMessages, activeId, user]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeId || !text.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage({ sender_id: user.id, recipient_id: activeId, body: text.trim() });
      setAllMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setText("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const active = contacts.find((s) => s.id === activeId);

  if (loading) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin inline" />
      </Card>
    );
  }

  if (contacts.length === 0) {
    return (
      <Card className="p-12 text-center text-sm text-muted-foreground">
        {isStaff ? "No patients found." : t("noMessages")}
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-9rem)]">
      {/* Sidebar */}
      <Card className="p-3 shadow-soft overflow-y-auto">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">
          {isStaff ? "Patients" : t("chat")}
        </h3>
        <div className="space-y-1">
          {contacts.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${activeId === s.id
                ? "bg-primary-soft text-primary border-primary/20"
                : "border-transparent hover:bg-muted/50"
                }`}
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                {s.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{s.full_name}</div>
                <div className="text-xs opacity-80 truncate capitalize">{s.role}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat area */}
      <Card className="flex flex-col shadow-soft overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border bg-background/50">
          <div className="h-10 w-10 rounded-full bg-primary-soft text-primary flex items-center justify-center">
            {isStaff ? <User className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{active?.full_name ?? "—"}</div>
            <div className="text-xs text-muted-foreground capitalize">{active?.role}</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-soft">
          {conversation.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No conversations yet
            </div>
          ) : (
            conversation.map((m) => {
              const mine = m.sender_id === user?.id;
              const time = new Date(m.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${mine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm"
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{m.body}</div>
                    <div className={`text-[10px] mt-1 ${mine ? "opacity-80" : "text-muted-foreground"}`}>
                      {time}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={send}
          className="flex items-center gap-2 p-3 border-t border-border bg-background"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("typeMessage")}
            className="flex-1"
            disabled={sending || !activeId}
          />
          <Button type="submit" size="icon" disabled={sending || !activeId || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}