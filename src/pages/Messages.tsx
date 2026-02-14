import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_time: string;
  unread: number;
  listing_id?: string;
}

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeName, setActiveName] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);
  const listingId = searchParams.get("listing");

  useEffect(() => {
    const toUser = searchParams.get("to");
    if (toUser) setActiveChat(toUser);
  }, [searchParams]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!msgs) return;
      const convMap: Record<string, Conversation> = {};
      for (const msg of msgs) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap[otherId]) {
          convMap[otherId] = {
            other_user_id: otherId,
            other_user_name: "",
            other_user_avatar: null,
            last_message: msg.content,
            last_time: msg.created_at,
            unread: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
            listing_id: msg.listing_id,
          };
        } else {
          if (msg.receiver_id === user.id && !msg.is_read) convMap[otherId].unread++;
        }
      }

      const ids = Object.keys(convMap);
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", ids);
        profiles?.forEach((p) => {
          if (convMap[p.user_id]) {
            convMap[p.user_id].other_user_name = p.display_name || "User";
            convMap[p.user_id].other_user_avatar = p.avatar_url;
          }
        });
      }

      // Also add the "to" user if not in conversations yet
      const toUser = searchParams.get("to");
      if (toUser && !convMap[toUser]) {
        const { data: p } = await supabase.from("profiles").select("user_id, display_name, avatar_url").eq("user_id", toUser).single();
        if (p) {
          convMap[toUser] = {
            other_user_id: toUser,
            other_user_name: p.display_name || "User",
            other_user_avatar: p.avatar_url,
            last_message: "",
            last_time: new Date().toISOString(),
            unread: 0,
          };
        }
      }

      setConversations(Object.values(convMap).sort((a, b) => b.last_time.localeCompare(a.last_time)));
    };
    fetchConversations();
  }, [user, searchParams]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!user || !activeChat) return;

    const conv = conversations.find((c) => c.other_user_id === activeChat);
    setActiveName(conv?.other_user_name || "User");

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      setMessages(data || []);

      // Mark as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", activeChat)
        .eq("receiver_id", user.id)
        .eq("is_read", false);
    };
    fetchMessages();

    // Realtime
    const channel = supabase
      .channel(`chat-${activeChat}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if (
          (msg.sender_id === user.id && msg.receiver_id === activeChat) ||
          (msg.sender_id === activeChat && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
          if (msg.receiver_id === user.id) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeChat]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat) return;
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeChat,
      content: newMessage.trim(),
      listing_id: listingId || null,
    });
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 h-[calc(100vh-5rem)]">
        <div className="container h-full py-4">
          <div className="flex h-full bg-card rounded-xl border border-border overflow-hidden shadow-soft">
            {/* Conversations */}
            <div className={`w-full md:w-80 border-r border-border flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
              <div className="p-4 border-b border-border">
                <h2 className="font-display font-bold text-foreground">Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet</div>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.other_user_id}
                      onClick={() => setActiveChat(c.other_user_id)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${activeChat === c.other_user_id ? "bg-muted/50" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {c.other_user_avatar ? (
                          <img src={c.other_user_avatar} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">{c.other_user_name[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.other_user_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
                      </div>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{c.unread}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat */}
            <div className={`flex-1 flex flex-col ${!activeChat ? "hidden md:flex" : "flex"}`}>
              {activeChat ? (
                <>
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <button onClick={() => setActiveChat(null)} className="md:hidden text-sm text-muted-foreground">← Back</button>
                    <p className="font-medium text-foreground">{activeName}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                          msg.sender_id === user?.id
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEnd} />
                  </div>
                  <div className="p-4 border-t border-border flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a conversation
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
