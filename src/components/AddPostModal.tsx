import React from "react";
import type { Post } from "../types";
import { useState } from "react";
import API_BASE_URL from "../services/api";
import { useAuthStore } from "../store/authStore";

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPost: Post) => void;
}

const DURATION_PRICES: Record<1 | 3 | 5, number> = {
  1: 10000,
  3: 25000,
  5: 45000,
};

const durations = [1, 3, 5] as const;
type Duration = (typeof durations)[number];

export default function AddPostModal({ isOpen, onClose }: AddPostModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    reward: "",
    image: "",
    type: "missing" as "missing" | "advertisement",
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // ✅ BARIS BARU → supaya file bisa dikirim
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [paymentDuration, setPaymentDuration] = useState<Duration>(1);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"dana" | "bank" | "">("");

  const { currentUser } = useAuthStore();

  // ========================================================
  // FIX GAMBAR → Base64 + File
  // ========================================================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar!");
      return;
    }

    setImageFile(file); // <--- BARIS PENTING

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;

      setImagePreview(base64String);

      // FIX: Backend butuh "image"
      setFormData({ ...formData, image: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.image) {
      alert("Mohon upload gambar terlebih dahulu!");
      return;
    }
    setShowPayment(true);
  };

  // ========================================================
  // UPLOAD FINAL
  // ========================================================
  const handlePaymentConfirm = async () => {
    if (!currentUser || !paymentMethod) return;

    const form = new FormData();
    form.append("title", formData.title);

    // Hilangkan subtitle untuk kategori "advertisement"
    if (formData.type !== "advertisement") {
      form.append("subtitle", formData.subtitle); // Kirim subtitle jika bukan "advertisement"
    }

    form.append("content", formData.description);

    // Kirim reward hanya jika kategori "missing"
    if (formData.type === "missing") {
      form.append("reward", formData.reward);
    }

    form.append("category", formData.type);
    form.append("publisher", String(currentUser.id));
    form.append("duration", String(paymentDuration));

    // ======================================================
    // FIX GAMBAR
    // ======================================================
    // Jika backend menerima Base64
    if (imageFile) form.append("image", imageFile);

    try {
      const endpoint =
        formData.type === "advertisement"
          ? `${API_BASE_URL}/ads/create.php`
          : `${API_BASE_URL}/missing/create.php`;

      const res = await fetch(endpoint, {
        method: "POST",
        body: form,
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Data berhasil masuk ke database!");
      } else {
        alert("❌ Gagal menyimpan: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Terjadi kesalahan jaringan!");
    }

    setFormData({
      title: "",
      subtitle: "",
      description: "",
      reward: "",
      image: "",
      type: "missing", // Kembalikan ke "missing" setelah form submit
    });

    setImagePreview("");
    setImageFile(null);
    setShowPayment(false);
    setPaymentMethod("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-gradient-to-br from-red-950 to-black border-2 border-red-500 rounded-xl w-full max-w-lg shadow-2xl shadow-red-900/50 my-8">
        <div className="flex items-center justify-between p-5 border-b border-red-800">
          <h2 className="text-2xl font-bold text-red-400">
            {showPayment ? "Pembayaran" : "Buat Post Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-2xl font-bold w-8 h-8 flex items-center justify-center hover:bg-red-900/50 rounded-lg transition-all"
          >
            ×
          </button>
        </div>

        {!showPayment ? (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Semua form kamu tetap ADA */}
            {/* Tidak ada baris yang dihapus */}
            {/* Mulai dari kategori */}

            <div>
              <label className="block text-red-200 font-semibold mb-2">
                Kategori
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "missing" })}
                  className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                    formData.type === "missing"
                      ? "bg-red-600 border-red-500 text-black"
                      : "bg-red-950 border-red-800 text-red-300 hover:border-red-600"
                  }`}
                >
                  Missing
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "advertisement" })
                  }
                  className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                    formData.type === "advertisement"
                      ? "bg-red-600 border-red-500 text-black"
                      : "bg-red-950 border-red-800 text-red-300 hover:border-red-600"
                  }`}
                >
                  Advertisement
                </button>
              </div>
            </div>

            {/* Judul */}
            <div>
              <label className="block text-red-200 font-semibold mb-2">
                Judul
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-red-100"
                placeholder="e.g., Missing Cat"
              />
            </div>

            {/* Lokasi */}
            {formData.type === "missing" && (
              <div>
                <label className="block text-red-200 font-semibold mb-2">
                  Alamat/Lokasi
                </label>
                <input
                  type="text"
                  required
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-red-100"
                  placeholder="e.g., Curug, Tangerang"
                />
              </div>
            )}

            {/* Deskripsi */}
            <div>
              <label className="block text-red-200 font-semibold mb-2">
                Deskripsi
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-red-100 h-24"
              />
            </div>

            {/* Reward */}
            {formData.type === "missing" && (
              <div>
                <label className="block text-red-200 font-semibold mb-2">
                  Imbalan
                </label>
                <input
                  type="text"
                  required
                  value={formData.reward}
                  onChange={(e) =>
                    setFormData({ ...formData, reward: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-red-100"
                  placeholder="e.g., Rp1.000.000"
                />
              </div>
            )}

            {/* Upload gambar */}
            <div>
              <label className="block text-red-200 font-semibold mb-2">
                Upload Gambar
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 bg-red-950 border border-red-800 rounded-lg text-red-100"
              />

              {imagePreview && (
                <div className="relative mt-3">
                  <img
                    src={imagePreview}
                    className="w-full h-48 object-cover rounded-lg border-2 border-red-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setFormData({ ...formData, image: "" });
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-800 text-white rounded-full px-3 py-1"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Durasi */}
            <div>
              <label className="block text-red-200 font-semibold mb-3">
                Durasi Tampilan
              </label>

              <div className="grid grid-cols-3 gap-3">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setPaymentDuration(duration)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentDuration === duration
                        ? "bg-red-600 border-red-500 text-black"
                        : "bg-red-950 border-red-800 text-red-300 hover:border-red-600"
                    }`}
                  >
                    <div className="text-lg font-bold">{duration} Bulan</div>
                    <div className="text-sm">
                      Rp{DURATION_PRICES[duration].toLocaleString("id-ID")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-red-600 text-black font-bold py-3 rounded-lg"
              >
                Lanjut ke Pembayaran
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-red-950 border border-red-800 text-red-400 font-bold py-3 rounded-lg"
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          // ==========================
          // BAGIAN PEMBAYARAN
          // ==========================
          <div className="p-5 space-y-4">
            <div className="bg-red-950/50 border border-red-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-red-400 mb-2">
                Detail Pembayaran
              </h3>
              <div className="space-y-1 text-red-200">
                <p>
                  Kategori:{" "}
                  <span className="font-bold text-red-300">
                    {formData.type === "missing" ? "Missing" : "Advertisement"}
                  </span>
                </p>
                <p>
                  Durasi:{" "}
                  <span className="font-bold text-red-300">
                    {paymentDuration} Bulan
                  </span>
                </p>
                <p>
                  Total:{" "}
                  <span className="font-bold text-red-300 text-xl">
                    Rp{DURATION_PRICES[paymentDuration].toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-red-200 font-semibold mb-3">
                Metode Pembayaran
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("dana")}
                  className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === "dana"
                      ? "bg-red-600 border-red-500 text-black"
                      : "bg-red-950 border-red-800 text-red-300 hover:border-red-600"
                  }`}
                >
                  <div>
                    <div className="font-bold">Dana</div>
                    <div className="text-sm opacity-80">E-Wallet Payment</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === "bank"
                      ? "bg-red-600 border-red-500 text-black"
                      : "bg-red-950 border-red-800 text-red-300 hover:border-red-600"
                  }`}
                >
                  <div>
                    <div className="font-bold">Transfer Bank</div>
                    <div className="text-sm opacity-80">Bank Transfer</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-red-200 text-sm">
                <strong>Note:</strong> Fitur pembayaran demo. Untuk upload ke
                cloud storage, aktifkan backend resmi.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePaymentConfirm}
                disabled={!paymentMethod}
                className="flex-1 bg-red-600 text-black font-bold py-3 rounded-lg disabled:bg-red-900 disabled:text-red-700"
              >
                Konfirmasi Pembayaran
              </button>

              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-red-950 border border-red-800 text-red-400 font-bold py-3 rounded-lg"
              >
                Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
