import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  currentUser: User | null;
  users: User[]; // opsional, bisa dipakai atau diabaikan
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],

      register: async (username: string, password: string) => {
        try {
          const formData = new FormData();
          formData.append("username", username);
          formData.append("password", password);

          const res = await fetch(
            "http://localhost/bounty-api/auth/register.php",
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();

          if (data.success) {
            const newUser: User = {
              id: data.id ?? "", // atau sesuai data backend
              username: data.username ?? username,
              token: data.token,
            };

            // simpan user (opsional)
            set({ users: [...get().users, newUser] });

            // set currentUser agar user dianggap login setelah registrasi
            set({ currentUser: newUser });

            return true;
          } else {
            // register gagal (username terpakai, dsb.)
            return false;
          }
        } catch (err) {
          console.error("Register error:", err);
          return false;
        }
      },

      login: async (username: string, password: string) => {
        try {
          const formData = new FormData();
          formData.append("username", username);
          formData.append("password", password);

          const res = await fetch(
            "http://localhost/bounty-api/auth/login.php",
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();

          if (data.success) {
            const user: User = {
              id: data.id ?? "",
              username: data.username ?? username,
              token: data.token,
            };

            set({ currentUser: user });
            return true;
          } else {
            return false;
          }
        } catch (err) {
          console.error("Login error:", err);
          return false;
        }
      },

      logout: () => {
        set({ currentUser: null });
      },
    }),
    {
      name: "auth-storage",
      // Kita hanya menyimpan currentUser (jika ada),
      // users[] tidak terlalu penting untuk login — optional.
      // Jika kamu tidak butuh users[], kamu bisa menghapusnya nanti.
    }
  )
);
