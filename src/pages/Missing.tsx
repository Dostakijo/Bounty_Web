import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePostStore } from "../store/postStore";
import PostCard from "../components/PostCard";
import ChatModal from "../components/ChatModal";
import HeaderBar from "../components/HeaderBar";
import AddPostButton from "../components/AddPostButton";
import AddPostModal from "../components/AddPostModal";

export default function Missing() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState({
    id: "",
    name: "",
  });

  const { posts, addPost, setPosts } = usePostStore();
  const navigate = useNavigate();

  // =====================================================
  // FETCH POSTINGAN DARI BACKEND (HANYA SEKALI)
  // =====================================================
  useEffect(() => {
    // Clear posts untuk mencegah duplikasi
    setPosts([]);

    fetch("http://localhost/bounty-api/missing/get.php")
      .then((res) => res.json())
      .then((data) => {
        console.log("API data:", data);

        if (Array.isArray(data)) {
          const mappedPosts = data.map((p: any) => ({
            id: Number(p.id),
            type: "missing" as const,

            title: p.title,
            subtitle: p.location ?? "",
            description: p.description ?? "",
            reward: Number(p.reward ?? 0),
            image: p.image ?? "",
            publisherId: String(p.publisher ?? ""),
            publisherName: p.publisher_name ?? p.publisher ?? "",
            createdAt: p.created_at ?? "",
          }));

          setPosts(mappedPosts);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [setPosts]);

  // =====================================================
  // FILTER POST
  // =====================================================
  const missingPosts = posts.filter((p) => p.type === "missing");

  const filteredPosts = missingPosts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.subtitle ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // =====================================================
  // CHAT MODAL
  // =====================================================
  const openChat = (publisherId: string, publisherName: string) => {
    setSelectedPublisher({ id: publisherId, name: publisherName });
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-red-900 text-red-100">
      <HeaderBar />

      <div className="pt-20 p-5">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-black text-red-500 tracking-widest mb-2 animate-pulse">
            REWARD FINDER
          </h1>
          <p className="text-red-300">Missing Items & People</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          <button
            onClick={() => navigate("/missing")}
            className="bg-red-500 text-black font-bold py-2 px-6 rounded-lg shadow-lg"
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

        {/* Search Filter */}
        <div className="max-w-5xl mx-auto mb-6 bg-gradient-to-r from-red-950 to-black border-2 border-red-500 rounded-lg p-4 flex flex-wrap items-center gap-4 shadow-lg">
          <div className="font-bold text-red-400">
            <span className="text-red-500 text-xl">{filteredPosts.length}</span>{" "}
            REWARDS
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-[200px] px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-red-100 placeholder-red-400 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Posts */}
        <div className="max-w-5xl mx-auto space-y-6 pb-24">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-red-300 py-12 bg-red-950/50 rounded-xl border border-red-800">
              {searchQuery
                ? "Tidak ada hasil pencarian"
                : "Belum ada postingan. Buat postingan pertama!"}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onMessage={() =>
                  openChat(String(post.publisherId), post.publisherName)
                }
              />
            ))
          )}
        </div>

        {/* Chat Modal */}
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          publisherId={selectedPublisher.id}
          publisherName={selectedPublisher.name}
        />
      </div>
    </div>
  );
}
