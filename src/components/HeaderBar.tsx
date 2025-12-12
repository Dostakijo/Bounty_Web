import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HeaderBar() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-red-950 to-black border-b-2 border-red-900 shadow-lg shadow-red-900/50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/my-posts")}
            className="flex items-center gap-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold"
          >
            <i className="hgi-stroke hgi-message-multiple-01 text-base"></i>
            <span className="hidden sm:inline">My Posts</span>
          </button>

          <button
            onClick={() => navigate("/chat-list")}
            className="flex items-center justify-center bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 w-9 h-9 rounded-lg transition-all"
            title="Messages"
          >
            <i className="hgi-stroke hgi-bubble-chat text-lg"></i>
          </button>
        </div>

        {/* Right Side */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 w-9 h-9 rounded-lg transition-all"
          title="Logout"
        >
          <i className="hgi-stroke hgi-logout-01 text-lg"></i>
        </button>
      </div>
    </div>
  );
}
