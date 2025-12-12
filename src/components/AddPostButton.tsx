import React from "react";

interface AddPostButtonProps {
  onClick: () => void;
  floating?: boolean;
}

export default function AddPostButton({
  onClick,
  floating = true,
}: AddPostButtonProps) {
  return (
    <button
      onClick={onClick}
      className={
        floating
          ? "fixed bottom-6 left-6 z-50 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-black font-bold py-3 px-6 rounded-full shadow-2xl shadow-red-500/50 hover:shadow-red-500/70 transition-all hover:scale-110 flex items-center gap-2"
          : "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-black font-bold py-2 px-5 rounded-xl shadow-lg transition-all flex items-center gap-2"
      }
    >
      <i className="hgi-stroke hgi-message-add-01 text-xl"></i>
      <span>Add Post</span>
    </button>
  );
}
