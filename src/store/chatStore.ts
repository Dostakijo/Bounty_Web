import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, Conversation } from "../types";

interface ChatState {
  messages: Message[];
  conversations: Conversation[];

  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (from: string, to: string, content: string) => Promise<void>;

  createOrGetConversation: (
    userId1: string,
    userName1: string,
    userId2: string,
    userName2: string
  ) => string;

  getConversationMessages: (conversationId: string) => Message[];
  getConversations: (userId: string) => Conversation[];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],

      // =============================================
      // LOAD CONVERSATION LIST
      // =============================================
      loadConversations: async (userId) => {
        try {
          const res = await fetch(
            `http://localhost/bounty-api/chat/list.php?user_id=${encodeURIComponent(
              userId
            )}`
          );

          const data = await res.json();
          const rows = Array.isArray(data) ? data : [];

          const mapped: Conversation[] = rows.map((r: any) => {
            const convoId = String(r.convo_id ?? r.id ?? "");

            const userA = String(r.user_a);
            const userB = String(r.user_b);

            // siapa "aku" & siapa "dia"
            const me = String(userId);
            const otherId = me === userA ? userB : userA;

            const otherName = r.other_username ?? r.other_name ?? "Unknown";

            return {
              // simpan semua bawaan backend
              ...r,

              // normalisasi
              id: convoId,
              participants: [userA, userB],
              participantNames: [otherName], // tidak dipakai, tapi biar komponen aman
              lastMessage: r.last_message ?? null,
              lastMessageTime: r.last_message_at ?? null,

              // buat gampang
              otherId,
              otherName,
            };
          });

          set({ conversations: mapped });
        } catch (err) {
          console.error("loadConversations error", err);
        }
      },

      // =============================================
      // LOAD MESSAGES
      // =============================================
      loadMessages: async (conversationId) => {
        try {
          const res = await fetch(
            `http://localhost/bounty-api/chat/messages.php?conversation_id=${encodeURIComponent(
              conversationId
            )}`
          );

          const data = await res.json();

          const mapped: Message[] = (data || []).map((m: any) => ({
            id: String(m.id ?? m.message_id ?? Date.now()),
            conversationId: String(
              m.conversation_id ?? m.convo_id ?? conversationId
            ),
            senderId: String(m.sender_id ?? ""),
            senderName: String(m.sender_name ?? m.sender_id ?? ""),
            content: m.message ?? "",
            timestamp: m.created_at ?? new Date().toISOString(),
          }));

          set({ messages: mapped });
        } catch (err) {
          console.error("loadMessages error", err);
        }
      },

      // =============================================
      // SEND MESSAGE
      // =============================================
      sendMessage: async (from, to, content) => {
        try {
          const res = await fetch("http://localhost/bounty-api/chat/send.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from, to, message: content }),
          });

          const result = await res.json();

          if (result?.conversation_id) {
            const convoId = String(result.conversation_id);

            await get().loadMessages(convoId);
            await get().loadConversations(String(from));
          } else {
            console.warn("sendMessage: no conversation_id", result);
          }
        } catch (err) {
          console.error("sendMessage error", err);
        }
      },

      // =============================================
      // LEGACY LOCAL
      // =============================================
      createOrGetConversation: (u1, n1, u2, n2) => {
        const { conversations } = get();
        const localId = [u1, u2].sort().join("-");

        const exist = conversations.find((c) => c.id === localId);
        if (exist) return localId;

        const newConv: Conversation = {
          id: localId,
          participants: [u1, u2],
          participantNames: [n1, n2],
          lastMessage: undefined,
          lastMessageTime: undefined,
        };

        set({ conversations: [...conversations, newConv] });
        return localId;
      },

      getConversationMessages: (conversationId) =>
        get()
          .messages.filter((m) => m.conversationId === conversationId)
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ),

      getConversations: (userId) =>
        get()
          .conversations.filter((c) => c.participants.includes(userId))
          .sort((a, b) => {
            const ta = a.lastMessageTime
              ? new Date(a.lastMessageTime).getTime()
              : 0;
            const tb = b.lastMessageTime
              ? new Date(b.lastMessageTime).getTime()
              : 0;
            return tb - ta;
          }),
    }),
    { name: "chat-storage" }
  )
);
