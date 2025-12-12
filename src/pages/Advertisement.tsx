import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostStore } from "../store/postStore";
import PostCard from "../components/PostCard";
import ChatModal from "../components/ChatModal";
import HeaderBar from "../components/HeaderBar";

export default function Advertisement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState({
    id: "",
    name: "",
  });

  const { posts, loadAdvertisementPosts } = usePostStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadAdvertisementPosts();
  }, []);

  const ads = posts.filter((p) => p.type === "advertisement");

  const filteredPosts = ads.filter((post) => {
    const q = searchQuery.toLowerCase();
    return (
      (post.title || "").toLowerCase().includes(q) ||
      (post.subtitle || "").toLowerCase().includes(q) ||
      (post.description || "").toLowerCase().includes(q)
    );
  });

  const openChat = (publisherId: string | number, publisherName: string) => {
    setSelectedPublisher({ id: String(publisherId), name: publisherName });
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
          <p className="text-red-300">Advertisements & Services</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          <button
            onClick={() => navigate("/missing")}
            className="bg-red-950 border-2 border-red-500 text-red-300 font-bold py-2 px-6 rounded-lg hover:bg-red-900 transition-all"
          >
            MISSING
          </button>
          <button className="bg-red-500 text-black font-bold py-2 px-6 rounded-lg shadow-lg">
            ADVERTISEMENT
          </button>
        </div>

        {/* Search */}
        <div
          className="max-w-5xl mx-auto mb-6 bg-gradient-to-r from-red-950 to-black 
          border-2 border-red-500 rounded-lg p-4 flex flex-wrap items-center gap-4 shadow-lg"
        >
          <div className="font-bold text-red-400">
            <span className="text-red-500 text-xl">{filteredPosts.length}</span>{" "}
            ADS
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
              Tidak ada iklan ditemukan
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onMessage={() => openChat(post.publisherId, post.publisherName)}
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
