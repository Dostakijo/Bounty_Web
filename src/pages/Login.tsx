import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const resetInputs = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username dan password harus diisi");
      return;
    }

    if (isLogin) {
      const success = await login(username, password);
      if (success) {
        navigate("/missing");
      } else {
        setError("Username atau password salah");
      }
    }

    if (!isLogin) {
      const success = await register(username, password);
      if (success) {
        setIsLogin(true); // kembali ke tab login
        resetInputs(); // kosongkan input
        setError("Akun berhasil dibuat, silakan login.");
      } else {
        setError("Username sudah digunakan");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-950 to-red-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-red-500 tracking-wider mb-2 animate-pulse">
            REWARD FINDER
          </h1>
          <p className="text-red-200 text-sm">Temukan dan posting reward</p>
        </div>

        <div className="bg-gradient-to-br from-red-950 to-black border-2 border-red-500 rounded-xl p-8 shadow-2xl shadow-red-900/50">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                resetInputs();
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                isLogin
                  ? "bg-red-500 text-black shadow-lg shadow-red-500/50"
                  : "bg-red-950 text-red-300 border border-red-800 hover:bg-red-900"
              }`}
            >
              LOGIN
            </button>

            <button
              onClick={() => {
                setIsLogin(false);
                resetInputs();
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                !isLogin
                  ? "bg-red-500 text-black shadow-lg shadow-red-500/50"
                  : "bg-red-950 text-red-300 border border-red-800 hover:bg-red-900"
              }`}
            >
              REGISTER
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
          >
            <div>
              <label className="block text-red-200 font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                autoComplete="new-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-100 placeholder-red-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label className="block text-red-200 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-100 placeholder-red-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                placeholder="Masukkan password"
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-black font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 hover:scale-[1.02]"
            >
              {isLogin ? "MASUK" : "DAFTAR"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
