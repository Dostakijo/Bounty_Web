import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import ChatModal from "../components/ChatModal";
import HeaderBar from "../components/HeaderBar";

export default function ChatList() {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ id: "", name: "" });

  const { currentUser } = useAuthStore();
  const { getConversations, loadConversations } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadConversations(String(currentUser.id));
    }
  }, [currentUser, loadConversations]);

  const conversations = currentUser
    ? getConversations(String(currentUser.id))
    : [];

  const openChat = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setChatOpen(true);
  };

  /**
   * FIXED: AMBIL LAWAN CHAT SECARA LANGSUNG
   * Tidak ada fallback ke ID lagi
   */
  const getOtherParticipant = (conv: any) => {
    const me = String(currentUser?.id);

    const userA = String(conv.user_a);
    const userB = String(conv.user_b);

    const otherId = userA === me ? userB : userA;

    // BACKEND TRANSPARENT → PAKAI LANGSUNG other_username
    const otherName = conv.other_username ?? otherId;

    return { id: otherId, name: otherName };
  };

  const getLastMessage = (conv: any) =>
    conv.last_message ?? conv.lastMessage ?? "";

  const getLastMessageTime = (conv: any) =>
    conv.last_message_at ?? conv.lastMessageTime ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-red-900 text-red-100">
      <HeaderBar />

      <div className="pt-20 p-5">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-black text-red-500 tracking-widest mb-2 animate-pulse">
            MESSAGES
          </h1>
          <p className="text-red-300">Percakapan Anda</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          <button
            onClick={() => navigate("/missing")}
            className="bg-red-950 border-2 border-red-500 text-red-300 font-bold py-2 px-6 rounded-lg hover:bg-red-900 transition-all"
          >
            MISSING
          </button>
          <button
            onClick={() => navigate("/advertisement")}
            className="bg-red-950 border-2 border-red-500 text-red-300 font-bold py-2 px-6 rounded-lg hover:bg-red-900 transition-all"
          >
            ADVERTISEMENT
          </button>
        </div>

        {/* Conversations */}
        <div className="max-w-3xl mx-auto space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center text-red-300 py-12 bg-red-950/50 rounded-xl border border-red-800">
              Belum ada percakapan. Mulai chat dengan klik MESSAGE di postingan!
            </div>
          ) : (
            conversations.map((conv: any) => {
              const other = getOtherParticipant(conv);
              const lastMsg = getLastMessage(conv);
              const lastTime = getLastMessageTime(conv);

              return (
                <div
                  key={conv.convo_id ?? conv.id}
                  onClick={() => openChat(other.id, other.name)}
                  className="bg-gradient-to-br from-red-950 to-black border-2 border-red-500 rounded-xl p-5 hover:shadow-2xl hover:shadow-red-500/40 transition-all cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center border-2 border-red-600">
                        <i className="hgi-stroke hgi-chat-user text-2xl text-red-300"></i>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-400">
                          {other.name}
                        </h3>

                        {lastMsg && (
                          <p className="text-sm text-red-300 truncate max-w-xs">
                            {lastMsg}
                          </p>
                        )}
                      </div>
                    </div>

                    {lastTime && (
                      <span className="text-xs text-red-400">
                        {new Date(lastTime).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Modal */}
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          publisherId={selectedUser.id}
          publisherName={selectedUser.name}
        />
      </div>
    </div>
  );
}
