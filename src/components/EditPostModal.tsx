import React, { useEffect, useState } from "react";
import type { Post } from "../types";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onSave: (updated: Post) => Promise<void> | void;
}

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onSave,
}: EditPostModalProps): JSX.Element | null {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Post["type"]>("missing");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState<number | "">("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // FILE YANG BENAR-BENAR DIUPLOAD
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!post) return;

    setTitle(post.title ?? "");
    setType(post.type ?? "missing");
    setSubtitle(post.subtitle ?? "");
    setDescription(post.description ?? "");
    setReward(post.reward ?? "");
    setImagePreview(post.image ?? null);
    setNewImageFile(null);
  }, [post, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    const updated: Post = {
      ...post,
      title: title.trim(),
      type,
      subtitle: subtitle.trim(),
      description: description.trim(),
      reward: typeof reward === "number" ? reward : Number(reward || 0),
      image: post.image,
      newImageFile: newImageFile, // 🔥 penting!
    };

    try {
      setLoading(true);
      await onSave(updated);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Edit save failed", err);
      setLoading(false);
      alert("Gagal menyimpan perubahan. Lihat console.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-gradient-to-br from-red-950 to-black border-2 border-red-700 rounded-xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-red-400">Edit Post</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-red-300 hover:text-red-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {/* TITLE */}
          <div>
            <label className="text-sm text-red-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-red-950 border border-red-800 text-red-100"
            />
          </div>

          {/* Tipe dan Subtitle hanya untuk Missing */}
          {type === "missing" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-red-300">
                  Subtitle / Category
                </label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-red-950 border border-red-800 text-red-100"
                />
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm text-red-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded-md bg-red-950 border border-red-800 text-red-100"
            />
          </div>

          {/* REWARD hanya untuk Missing */}
          {type === "missing" && (
            <div>
              <label className="text-sm text-red-300">Reward</label>
              <input
                value={reward}
                onChange={(e) =>
                  setReward(
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value.replace(/\D/g, ""))
                  )
                }
                inputMode="numeric"
                className="w-36 px-3 py-2 rounded-md bg-red-950 border border-red-800 text-red-100"
                placeholder="0"
              />
            </div>
          )}

          {/* IMAGE */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-sm text-red-300">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-red-200"
              />
            </div>
          </div>

          {/* PREVIEW */}
          {imagePreview && (
            <div>
              <label className="text-sm text-red-300">Preview</label>
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="max-h-40 object-cover rounded-lg border border-red-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-red-700 text-red-300 hover:bg-red-900"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-md bg-gradient-to-r from-red-600 to-red-700 text-black font-bold"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
