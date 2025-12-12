import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  publisherId: string;
  publisherName: string;
}

export default function ChatModal({
  isOpen,
  onClose,
  publisherId,
  publisherName,
}: ChatModalProps) {
  // -----------------------
  // ALL HOOKS (WAJIB BERADA PALING ATAS)
  // -----------------------
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useAuthStore();
  const {
    sendMessage,
    getConversationMessages,
    loadMessages,
    loadConversations,
    getConversations,
    createOrGetConversation,
  } = useChatStore();

  // Safe strings
  const meId = currentUser ? String(currentUser.id) : "";
  const meName = currentUser ? String(currentUser.username) : "";
  const otherId = String(publisherId ?? "");
  const otherName = String(publisherName ?? "");

  // conversation DB id (string) if exists in loaded conversations
  const [conversationId, setConversationId] = useState<string>("");

  // When modal opens, ensure conversations are loaded then load messages for that conversation if exists
  useEffect(() => {
    let cancelled = false;
    const prepare = async () => {
      if (!isOpen || !meId || !otherId) return;

      // load latest conversations for me
      await loadConversations(meId);

      // try to find a DB conversation id that contains both participants
      const all = getConversations(meId);
      const found = all.find(
        (c) => c.participants.includes(meId) && c.participants.includes(otherId)
      );
      if (found) {
        if (!cancelled) {
          setConversationId(String(found.id));
          await loadMessages(String(found.id));
        }
      } else {
        // no existing convo in backend: we still keep local deterministic id (not DB id)
        const local = createOrGetConversation(meId, meName, otherId, otherName);
        setConversationId(local);
        // messages remain empty until sendMessage creates a convo in backend
      }
    };

    prepare();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, meId, otherId]);

  // Get messages (cached)
  const messages = conversationId
    ? getConversationMessages(conversationId)
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !meId) return;

    // call backend send; backend will create conversation if missing and return conversation_id
    await sendMessage(meId, otherId, message.trim());

    // after sendMessage, backend store updated; refresh conversations & messages
    await loadConversations(meId);

    // try to find DB convo id now
    const all = getConversations(meId);
    const found = all.find(
      (c) => c.participants.includes(meId) && c.participants.includes(otherId)
    );
    if (found) {
      setConversationId(String(found.id));
      await loadMessages(String(found.id));
    }

    setMessage("");
  };

  // -----------------------
  // LOGIC SETELAH SEMUA HOOKS (AMAN)
  // -----------------------

  // Jika modal belum dibuka
  if (!isOpen) return null;

  // Cegah chat diri sendiri
  const isSelf = meId && otherId && meId === otherId;
  if (isSelf) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-gradient-to-br from-red-950 to-black border-2 border-red-500 rounded-xl w-full max-w-md p-6 shadow-2xl shadow-red-900/50 text-center">
          <h3 className="text-xl font-bold text-red-400 mb-4">
            Tidak bisa mengirim pesan ke diri sendiri
          </h3>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-black font-bold py-2 px-6 rounded-lg transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // -----------------------
  // UI CHAT (AMAN)
  // -----------------------
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-red-950 to-black border-2 border-red-500 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl shadow-red-900/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-800">
          <h3 className="text-xl font-bold text-red-400">
            Chat dengan {otherName}
          </h3>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-2xl font-bold w-8 h-8 flex items-center justify-center hover:bg-red-900/50 rounded-lg transition-all"
            aria-label="Tutup chat"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-red-300 py-8">
              Belum ada pesan. Mulai percakapan!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = meId && msg.senderId === meId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-black"
                        : "bg-red-950 text-red-100 border border-red-800"
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {msg.senderName}
                    </p>
                    <p className="break-words">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-red-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-red-100 placeholder-red-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-red-900 disabled:to-red-900 disabled:cursor-not-allowed text-black font-bold py-2 px-6 rounded-lg transition-all shadow-lg"
            >
              Kirim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
