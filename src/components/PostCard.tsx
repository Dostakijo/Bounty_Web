import React from "react";
import { Post } from "../types";

interface PostCardProps {
  post: Post;
  onMessage?: () => void;
  hideMessageButton?: boolean;
  isMyPost?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode; // Tambahkan children
}

export default function PostCard({
  post,
  onMessage,
  hideMessageButton,
  isMyPost = false,
  onEdit,
  onDelete,
}: PostCardProps) {
  // IMAGE HANDLING
  const imageSrc =
    typeof post.image === "string" && post.image.startsWith("data:image")
      ? post.image
      : `http://localhost/bounty-api/uploads/${post.image}`;

  // GET DATA FROM API
  const category = post.type || post.category || ""; // Menangani kategori
  const description = post.description || post.content || ""; // Menangani deskripsi
  const subtitle =
    post.type === "advertisement"
      ? null
      : post.location || post.subtitle || "Lokasi tidak tersedia"; // Menampilkan lokasi jika bukan advertisement
  const publisherName = post.publisherName || ""; // Menampilkan nama publisher

  return (
    <div
      className="w-full max-w-5xl mx-auto 
      flex flex-col md:flex-row bg-gradient-to-br from-red-950 to-black 
      border-2 border-red-600 rounded-xl p-5 gap-5 shadow-xl shadow-red-900/40 
      hover:shadow-red-600/40 transition-all"
    >
      {/* IMAGE */}
      {post.image && (
        <img
          src={imageSrc}
          alt={post.title}
          className="w-full md:w-48 h-60 object-cover rounded-lg border-2 border-red-800 shadow-lg flex-shrink-0"
        />
      )}

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <h3 className="text-2xl md:text-3xl font-black text-red-400 mb-1 break-words">
          {post.title}
        </h3>
        <p className="text-red-300 font-semibold text-sm mb-1">
          Kategori: {category}
        </p>
        {/* Location */}
        {subtitle && (
          <p className="text-red-300 text-sm mb-1">Location: {subtitle}</p>
        )}
        <p className="text-red-100 leading-relaxed break-words mb-3 max-w-full">
          {description}
        </p>
        {/* Reward for missing posts */}
        {typeof post.reward !== "undefined" && post.reward ? (
          <p className="text-red-300 font-bold text-lg mb-4">
            Reward:{" "}
            <span className="text-red-400">
              Rp {post.reward.toLocaleString()}
            </span>
          </p>
        ) : null}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-red-800/40 gap-4">
          {/* Publisher Name */}
          <p className="text-red-300 text-sm">
            Publisher:{" "}
            <span className="font-bold text-red-400">{publisherName}</span>
          </p>

          <div className="flex items-center gap-3">
            {/* MESSAGE BUTTON */}
            {!hideMessageButton && (
              <button
                onClick={onMessage}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 
                text-black font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 
                transition-all"
              >
                MESSAGE
              </button>
            )}

            {/* EDIT / DELETE FOR MY POSTS */}
            {isMyPost && (
              <>
                <button
                  onClick={onEdit}
                  className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg shadow-sm hover:brightness-105 transition"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="bg-red-600 text-black font-semibold px-4 py-2 rounded-lg shadow-sm hover:brightness-95 transition"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
