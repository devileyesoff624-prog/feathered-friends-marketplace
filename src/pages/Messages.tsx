import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useE2EEncryption } from "@/hooks/use-e2e-encryption";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Shield, ShieldCheck, Search, MessageCircle, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

const MAX_MESSAGE_LENGTH = 2000;

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_time: string;
  unread: number;
  listing_id?: string;
}

interface DecryptedMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  decrypted_content: string;
  created_at: string;
  is_read: boolean;
  listing_id: string | null;
  encrypted: boolean;
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday " + format(date, "h:mm a");
  return format(date, "MMM d, h:mm a");
}

function formatConversationTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeName, setActiveName] = useState("");
  const [activeAvatar, setActiveAvatar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listingId = searchParams.get("listing");
  const { ready: e2eReady, encrypt, decrypt, isEncrypted } = useE2EEncryption();

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
            listing_id: msg.listing_id ?? undefined,
          };
        } else {
          if (msg.receiver_id === user.id && !msg.is_read) convMap[otherId].unread++;
        }
      }

      const ids = Object.keys(convMap);
      if (ids.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles_public" as any)
          .select("user_id, display_name, avatar_url")
          .in("user_id", ids) as { data: { user_id: string; display_name: string | null; avatar_url: string | null }[] | null };
        profiles?.forEach((p) => {
          if (convMap[p.user_id]) {
            convMap[p.user_id].other_user_name = p.display_name || "User";
            convMap[p.user_id].other_user_avatar = p.avatar_url;
          }
        });
      }

      // Decrypt last messages for display
      for (const conv of Object.values(convMap)) {
        if (conv.last_message && isEncrypted(conv.last_message)) {
          conv.last_message = await decrypt(conv.last_message, conv.other_user_id);
        }
      }

      const toUser = searchParams.get("to");
      if (toUser && !convMap[toUser]) {
        const { data: p } = await supabase
          .from("profiles_public" as any)
          .select("user_id, display_name, avatar_url")
          .eq("user_id", toUser)
          .single() as { data: { user_id: string; display_name: string | null; avatar_url: string | null } | null };
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
  }, [user, searchParams, e2eReady]);

  const decryptMessages = useCallback(async (rawMessages: any[], otherUserId: string): Promise<DecryptedMessage[]> => {
    return Promise.all(
      rawMessages.map(async (msg) => ({
        ...msg,
        encrypted: isEncrypted(msg.content),
        decrypted_content: isEncrypted(msg.content)
          ? await decrypt(msg.content, otherUserId)
          : msg.content,
      }))
    );
  }, [decrypt, isEncrypted]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!user || !activeChat) return;

    const conv = conversations.find((c) => c.other_user_id === activeChat);
    setActiveName(conv?.other_user_name || "User");
    setActiveAvatar(conv?.other_user_avatar || null);

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      const decrypted = await decryptMessages(data || [], activeChat);
      setMessages(decrypted);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", activeChat)
        .eq("receiver_id", user.id)
        .eq("is_read", false);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${activeChat}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        const msg = payload.new as any;
        if (
          (msg.sender_id === user.id && msg.receiver_id === activeChat) ||
          (msg.sender_id === activeChat && msg.receiver_id === user.id)
        ) {
          const decrypted: DecryptedMessage = {
            ...msg,
            encrypted: isEncrypted(msg.content),
            decrypted_content: isEncrypted(msg.content)
              ? await decrypt(msg.content, activeChat)
              : msg.content,
          };
          setMessages((prev) => [...prev, decrypted]);
          if (msg.receiver_id === user.id) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeChat, e2eReady]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeChat) inputRef.current?.focus();
  }, [activeChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat || sending) return;
    const trimmed = newMessage.trim();
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: "Message too long",
        description: `Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    const encryptedContent = await encrypt(trimmed, activeChat);

    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeChat,
      content: encryptedContent,
      listing_id: listingId || null,
    });

    setNewMessage("");
    setSending(false);
  };

  const filteredConversations = conversations.filter((c) =>
    c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 h-[calc(100vh-5rem)]">
        <div className="container h-full py-4 max-w-6xl">
          <div className="flex h-full bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
            {/* Sidebar - Conversations */}
            <div className={cn(
              "w-full md:w-96 border-r border-border flex flex-col bg-card",
              activeChat ? "hidden md:flex" : "flex"
            )}>
              <div className="p-5 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-foreground">Messages</h2>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span>Encrypted</span>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-9 bg-muted/20 border-border/50"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No conversations yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Start chatting with a seller from their listing page
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((c) => (
                    <button
                      key={c.other_user_id}
                      onClick={() => setActiveChat(c.other_user_id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-5 py-4 transition-colors border-b border-border/30",
                        activeChat === c.other_user_id
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : "hover:bg-muted/20"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-border/30">
                        {c.other_user_avatar ? (
                          <img src={c.other_user_avatar} className="w-full h-full rounded-full object-cover" alt={c.other_user_name} />
                        ) : (
                          <span className="text-base font-bold text-primary">{c.other_user_name[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground truncate">{c.other_user_name}</p>
                          <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                            {formatConversationTime(c.last_time)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate pr-2">
                            {c.last_message || "Start a conversation"}
                          </p>
                          {c.unread > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Panel */}
            <div className={cn(
              "flex-1 flex flex-col bg-background/50",
              !activeChat ? "hidden md:flex" : "flex"
            )}>
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="px-5 py-4 border-b border-border bg-card flex items-center gap-3">
                    <button
                      onClick={() => setActiveChat(null)}
                      className="md:hidden p-1 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {activeAvatar ? (
                        <img src={activeAvatar} className="w-full h-full rounded-full object-cover" alt={activeName} />
                      ) : (
                        <span className="text-sm font-bold text-primary">{activeName[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{activeName}</p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>End-to-end encrypted</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                    {/* E2E notice */}
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center gap-1.5 bg-primary/5 text-primary text-[11px] px-3 py-1.5 rounded-full border border-primary/10">
                        <Shield className="w-3 h-3" />
                        Messages are end-to-end encrypted. Only you and {activeName} can read them.
                      </div>
                    </div>

                    {messages.map((msg, i) => {
                      const isMine = msg.sender_id === user?.id;
                      const showTime = i === 0 || (new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime()) > 300000;

                      return (
                        <div key={msg.id}>
                          {showTime && (
                            <div className="flex justify-center my-3">
                              <span className="text-[10px] text-muted-foreground bg-muted/20 px-2.5 py-0.5 rounded-full">
                                {formatMessageTime(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={cn("flex mb-1", isMine ? "justify-end" : "justify-start")}>
                            <div className={cn(
                              "max-w-[75%] px-4 py-2.5 text-sm leading-relaxed",
                              isMine
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                                : "bg-card text-foreground rounded-2xl rounded-bl-md border border-border/50"
                            )}>
                              <p className="whitespace-pre-wrap break-words">{msg.decrypted_content}</p>
                              {msg.encrypted && (
                                <div className={cn(
                                  "flex items-center gap-1 mt-1 text-[10px]",
                                  isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                                )}>
                                  <Lock className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEnd} />
                  </div>

                  {/* Input Area */}
                  <div className="px-5 py-4 border-t border-border bg-card">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Input
                          ref={inputRef}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                          placeholder="Type a message..."
                          maxLength={MAX_MESSAGE_LENGTH}
                          className="bg-muted/20 border-border/50 rounded-xl"
                          disabled={sending}
                        />
                        {newMessage.length > MAX_MESSAGE_LENGTH * 0.8 && (
                          <span className={cn(
                            "text-xs",
                            newMessage.length > MAX_MESSAGE_LENGTH ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {newMessage.length}/{MAX_MESSAGE_LENGTH}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={sendMessage}
                        size="icon"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-xl h-10 w-10 flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-5">
                    <MessageCircle className="w-10 h-10 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Your Messages</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Select a conversation to start chatting. All messages are end-to-end encrypted for your privacy.
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-xs text-primary">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Protected by E2E encryption</span>
                  </div>
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
