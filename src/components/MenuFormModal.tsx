import React, { useState, useEffect } from "react";
import { MenuItem } from "../types";
import { X, Upload, Check, AlertCircle, RefreshCw } from "lucide-react";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: any) => Promise<boolean>;
  editingItem?: MenuItem | null;
}

export default function MenuFormModal({ isOpen, onClose, onSubmit, editingItem }: MenuFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [category, setCategory] = useState<"Drink" | "Food">("Drink");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description);
      setRegularPrice(editingItem.regularPrice.toString());
      setVipPrice(editingItem.vipPrice.toString());
      setCategory(editingItem.category);
      setImageUrl(editingItem.imageUrl);
      setImagePreview(editingItem.imageUrl);
    } else {
      setName("");
      setDescription("");
      setRegularPrice("");
      setVipPrice("");
      setCategory("Drink");
      setImageUrl("");
      setImagePreview(null);
    }
    setError(null);
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    // MIME Validation
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WEBP images are supported.");
      return;
    }

    // Size Validation (2MB)
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Image size exceeds maximum limits of 2MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Str = e.target?.result as string;
      setImageUrl(base64Str);
      setImagePreview(base64Str);
    };
    reader.onerror = () => {
      setError("Failed to convert image binary stream.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name.trim()) return setError("Menu item name is required.");
    if (!description.trim()) return setError("Menu item description is required.");
    
    const rPriceNum = parseFloat(regularPrice);
    const vPriceNum = parseFloat(vipPrice);

    if (isNaN(rPriceNum) || rPriceNum <= 0) return setError("Regular price must be a positive number.");
    if (isNaN(vPriceNum) || vPriceNum <= 0) return setError("VIP price must be a positive number.");
    if (!imageUrl) return setError("Image upload is required.");

    setLoading(true);
    const dataToSend = {
      name: name.trim(),
      description: description.trim(),
      regularPrice: rPriceNum,
      vipPrice: vPriceNum,
      category,
      imageUrl,
    };

    const success = await onSubmit(dataToSend);
    setLoading(false);

    if (success) {
      onClose();
    } else {
      setError("Failed to process transaction. Check inputs validity.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Box */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-sans font-extrabold text-white tracking-tight">
          {editingItem ? "Update Spectrum ItemID" : "Establish New Spectrum Item"}
        </h3>
        <p className="text-xs text-neutral-400 font-mono mt-1">
          Configure menu properties with dual-price VIP margins.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1">Item Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-white text-sm font-sans focus:outline-none focus:border-violet-500 transition"
              placeholder="e.g. Glowing Elixir"
            />
          </div>

          {/* Category & Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-white text-sm font-sans focus:outline-none focus:border-violet-500 transition"
              >
                <option value="Drink">Drinks</option>
                <option value="Food">Foods</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1">Reg (₦)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-violet-500 transition"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-amber-500 font-bold mb-1">VIP (₦)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={vipPrice}
                  onChange={(e) => setVipPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-yellow-500/20 rounded-xl text-amber-100 text-sm font-mono focus:outline-none focus:border-amber-500 transition"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1">Descriptions</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-white text-sm font-sans focus:outline-none focus:border-violet-500 transition resize-none"
              placeholder="Brief gourmet or flavor description..."
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1">Display Asset</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              {/* Preview */}
              <div className="sm:col-span-1 h-20 rounded-xl border border-white/10 bg-black/60 overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-[9px] text-neutral-600 font-mono">[PREVIEW]</span>
                )}
              </div>

              {/* Selector */}
              <div className="sm:col-span-3">
                <label
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center h-20 border border-dashed rounded-xl cursor-pointer transition ${
                    dragActive
                      ? "border-violet-500 bg-violet-500/5"
                      : "border-white/10 bg-black/30 hover:border-violet-500/20"
                  }`}
                >
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <Upload size={14} className="text-neutral-500 mb-1" />
                    <span className="text-[10px] text-neutral-300 font-mono">Drop image file or click to browse</span>
                    <span className="text-[8px] text-neutral-500 font-mono mt-0.5">JPG, PNG, WEBP (Max 2MB)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action trigger */}
          <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-mono border border-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-mono font-semibold hover:bg-violet-500 transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              {editingItem ? "Commit Updates" : "Deploy Spectrum"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
