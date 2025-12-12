import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Post } from "../types";

type PostWithFile = Post & { newImageFile?: File | null };

interface PostState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (newPost: Post) => void;

  loadMissingPosts: () => Promise<void>;
  loadAdvertisementPosts: () => Promise<void>;
  fetchMyPosts: (userId: number) => Promise<void>;

  deletePost: (id: number, type: "missing" | "advertisement") => Promise<void>;
  updatePost: (post: PostWithFile) => Promise<void>;

  getPostsByType: (type: "missing" | "advertisement") => Post[];
}

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: [],

      setPosts: (posts) => set({ posts }),

      addPost: (newPost) =>
        set((state) => {
          if (state.posts.some((p) => p.id === newPost.id)) return state;
          return { posts: [...state.posts, newPost] };
        }),

      // ===============================
      // LOAD MISSING POSTS
      // ===============================
      loadMissingPosts: async () => {
        try {
          const res = await fetch(
            "http://localhost/bounty-api/missing/get.php"
          );
          const arr = await res.json();

          const mapped = Array.isArray(arr)
            ? arr.map((p: any) => ({
                id: Number(p.id),
                type: "missing" as const,
                title: p.title,
                subtitle: p.location,
                description: p.description ?? "",
                reward: Number(p.reward ?? 0),
                duration: 0,
                image: p.image ?? "",
                publisherId: p.publisher ?? "",
                publisherName: p.publisher_name ?? "",
                createdAt: p.created_at ?? "",
              }))
            : [];

          set((state) => ({
            posts: [
              ...state.posts.filter((x) => x.type !== "missing"),
              ...mapped,
            ],
          }));
        } catch (err) {
          console.error("loadMissingPosts:", err);
        }
      },

      // ===============================
      // LOAD ADVERTISEMENT POSTS
      // ===============================
      loadAdvertisementPosts: async () => {
        try {
          const res = await fetch("http://localhost/bounty-api/ads/get.php");
          const arr = await res.json();

          const mapped = Array.isArray(arr)
            ? arr.map((p: any) => ({
                id: Number(p.id),
                type: "advertisement" as const,
                title: p.title,
                subtitle: p.category,
                description: p.content ?? "",
                reward: 0,
                duration: Number(p.duration ?? 0),
                image: p.image ?? "",
                publisherId: p.publisher ?? "",
                publisherName: p.publisher_name ?? "",
                createdAt: p.created_at ?? "",
              }))
            : [];

          set((state) => ({
            posts: [
              ...state.posts.filter((x) => x.type !== "advertisement"),
              ...mapped,
            ],
          }));
        } catch (err) {
          console.error("loadAdvertisementPosts:", err);
        }
      },

      // ===============================
      // LOAD MY POSTS
      // ===============================
      fetchMyPosts: async (userId: number) => {
        try {
          const res = await fetch(
            `http://localhost/bounty-api/my_post.php?userId=${userId}`
          );
          const arr = await res.json();

          const mapped = Array.isArray(arr)
            ? arr.map((p: any) => ({
                id: Number(p.id),
                type: p.type,
                title: p.title,
                subtitle: p.subtitle || p.category,
                description: p.description ?? p.content ?? "",
                reward: Number(p.reward ?? 0),
                duration: Number(p.duration ?? 0),
                image: p.image ?? "",
                publisherId: p.publisher ?? "",
                publisherName: p.publisherName ?? "",
                createdAt: p.created_at ?? "",
              }))
            : [];

          set((state) => ({
            posts: [
              ...state.posts.filter(
                (x) => String(x.publisherId) !== String(userId)
              ),
              ...mapped,
            ],
          }));
        } catch (err) {
          console.error("fetchMyPosts:", err);
        }
      },

      // ===============================
      // DELETE POST
      // ===============================
      deletePost: async (id, type) => {
        try {
          await fetch("http://localhost/bounty-api/delete.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id,
              table: type === "missing" ? "missing" : "ads",
            }),
          });

          set((state) => ({
            posts: state.posts.filter((p) => p.id !== id),
          }));
        } catch (err) {
          console.error("deletePost:", err);
        }
      },

      // ===============================
      // UPDATE POST
      // ===============================
      updatePost: async (post) => {
        try {
          const form = new FormData();

          form.append("id", String(post.id));
          form.append("table", post.type === "missing" ? "missing" : "ads");
          form.append("title", post.title);
          form.append("old_image", post.image ?? "");

          if (post.type === "missing") {
            form.append("location", post.subtitle ?? "");
            form.append("description", post.description ?? "");
            form.append("reward", String(post.reward ?? 0));
          }

          if (post.type === "advertisement") {
            form.append("category", post.subtitle ?? "");
            form.append("content", post.description ?? "");
            form.append("duration", String(post.duration ?? 0));
          }

          if (post.newImageFile instanceof File) {
            form.append("image", post.newImageFile, post.newImageFile.name);
          }

          const res = await fetch("http://localhost/bounty-api/update.php", {
            method: "POST",
            body: form,
          });

          const data = await res.json();

          const finalImage = data.image ?? post.image;

          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === post.id ? { ...p, ...post, image: finalImage } : p
            ),
          }));
        } catch (err) {
          console.error("updatePost:", err);
        }
      },

      getPostsByType: (type) => get().posts.filter((p) => p.type === type),
    }),
    { name: "post-storage" }
  )
);
