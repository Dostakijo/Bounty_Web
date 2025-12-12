import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import PostCard from "../components/PostCard";
import HeaderBar from "../components/HeaderBar";
import AddPostButton from "../components/AddPostButton";
import AddPostModal from "../components/AddPostModal";
import EditPostModal from "../components/EditPostModal";
import type { Post } from "../types";

export default function MyPosts(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "missing" | "advertisement"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { posts, fetchMyPosts, addPost, deletePost, updatePost } =
    usePostStore();

  useEffect(() => {
    if (currentUser?.id) {
      void fetchMyPosts(Number(currentUser.id)); // Ambil data postingan pengguna
    }
  }, [currentUser, fetchMyPosts]);

  useEffect(() => {
    console.log(posts); // Memeriksa data yang di-fetch
  }, [posts]);

  // Filter posts owned by current user
  const myPosts = posts.filter(
    (p) => String(p.publisherId) === String(currentUser?.id)
  );

  // Filter by type dropdown
  const filteredByType = myPosts.filter((p) =>
    filterType === "all" ? true : p.type === filterType
  );

  // Search filter
  const q = searchQuery.trim().toLowerCase();
  const filteredPosts = filteredByType.filter((post) => {
    if (!q) return true;

    const title = String(post.title ?? "").toLowerCase();
    const subtitle = String(post.subtitle ?? "").toLowerCase();
    const description = String(post.description ?? "").toLowerCase();

    return title.includes(q) || subtitle.includes(q) || description.includes(q);
  });

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updated: Post) => {
    try {
      await updatePost(updated);
    } catch (err) {
      console.error("Failed saving edit", err);
      alert("Gagal menyimpan perubahan, cek console.");
    } finally {
      setShowEditModal(false);
      setEditingPost(null);
    }
  };

  const handleDelete = async (
    id: number,
    type: "missing" | "advertisement"
  ) => {
    if (!confirm("Yakin ingin menghapus postingan ini?")) return;
    try {
      await deletePost(id, type);
    } catch (err) {
      console.error("delete failed", err);
      alert("Gagal menghapus postingan, cek console.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-red-900 text-red-100 relative">
      <HeaderBar />

      <div className="pt-24 px-5 max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-red-500 tracking-widest">
            MY POSTS
          </h1>
          <p className="text-red-300 mt-2">Postingan Anda</p>
        </div>

        {/* Back + Add */}
        <div className="w-full flex justify-between items-center mb-10 px-1">
          <button
            onClick={() => navigate("/missing")}
            className="flex items-center gap-2 px-5 py-2 bg-red-900/60 border border-red-700 text-red-300 rounded-xl hover:bg-red-800/70 hover:text-white transition shadow-lg"
          >
            ← Back
          </button>

          <AddPostButton
            onClick={() => setShowAddModal(true)}
            floating={false}
          />
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-red-950 to-black border-2 border-red-500 rounded-lg p-4 flex flex-wrap items-center gap-4 shadow-lg mb-8">
          <div className="font-bold text-red-400">
            <span className="text-red-500 text-xl">{filteredPosts.length}</span>{" "}
            POSTS
          </div>

          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-red-100 placeholder-red-400 focus:border-red-500"
          />

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value as "all" | "missing" | "advertisement"
              )
            }
            className="px-4 py-2 bg-red-950 border border-red-700 rounded-lg text-red-200"
          >
            <option value="all">All</option>
            <option value="missing">Missing</option>
            <option value="advertisement">Advertisement</option>
          </select>
        </div>

        {/* Posts list */}
        <div className="space-y-6 pb-24">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-red-300 py-12 bg-red-950/50 rounded-xl border border-red-800">
              {searchQuery
                ? "Tidak ada hasil pencarian"
                : "Anda belum memiliki postingan."}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isMyPost={true}
                hideMessageButton={true}
                onEdit={() => handleEdit(post)}
                onDelete={() => handleDelete(Number(post.id), post.type)}
              >
                {/* Menampilkan lokasi dan publisher */}
                <p className="text-red-300 text-sm mb-1">
                  Location: {post.subtitle || "Lokasi tidak tersedia"}
                </p>
                <p className="text-red-200">
                  Publisher: {post.publisherName || "Publisher tidak tersedia"}
                </p>
              </PostCard>
            ))
          )}
        </div>
      </div>

      <AddPostModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(newPost: Post) => addPost(newPost)}
      />

      <EditPostModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPost(null);
        }}
        post={editingPost}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
