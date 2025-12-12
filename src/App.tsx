import React from "react"; // WAJIB supaya JSX tidak error
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import Login from "./pages/Login";
import Missing from "./pages/Missing";
import Advertisement from "./pages/Advertisement";
import MyPosts from "./pages/MyPosts";
import ChatList from "./pages/ChatList";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuthStore();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/missing"
          element={
            <ProtectedRoute>
              <Missing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advertisement"
          element={
            <ProtectedRoute>
              <Advertisement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-posts"
          element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat-list"
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          }
        />

        {/* fallback ke login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
