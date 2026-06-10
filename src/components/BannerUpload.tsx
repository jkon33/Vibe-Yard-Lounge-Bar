import React, { useState } from "react";
import { apiService } from "../services/api";
import { Trash2, ArrowUp, ArrowDown, Upload, Plus, AlertCircle, RefreshCw } from "lucide-react";

interface BannerUploadProps {
  banners: string[];
  onBannersUpdated: (newBanners: string[]) => void;
}

export default function BannerUpload({ banners, onBannersUpdated }: BannerUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    // Limits check
    if (banners.length >= 5) {
      setError("Maximum of 5 carousel slide banners allowed.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WEBP images are supported.");
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Image size exceeds 2MB limits.");
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Str = e.target?.result as string;
      const response = await apiService.addBanner(base64Str);
      setUploading(false);

      if (response.success && response.data) {
        onBannersUpdated(response.data.banners);
      } else {
        setError(response.message || "Failed to submit banner slide.");
      }
    };

    reader.onerror = () => {
      setUploading(false);
      setError("Error translating upload data stream.");
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDelete = async (index: number) => {
    setError(null);
    const response = await apiService.deleteBanner(index);
    if (response.success && response.data) {
      onBannersUpdated(response.data.banners);
    } else {
      setError(response.message || "Failed to erase banner.");
    }
  };

  const moveBanner = async (index: number, direction: "up" | "down") => {
    const updated = [...banners];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    // Swap elements
    [updated[index], updated[targetIdx]] = [updated[targetIdx], updated[index]];
    
    setError(null);
    const response = await apiService.updateBannersOrder(updated);
    if (response.success && response.data) {
      onBannersUpdated(response.data.banners);
    } else {
      setError(response.message || "Failed to update banner prioritization.");
    }
  };

  return (
    <div id="banner-uploader" className="p-6 rounded-2xl border border-white/5 bg-neutral-950/40 backdrop-blur-md">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-sans font-extrabold text-white tracking-tight">Banner Carousel Management</h3>
        <p className="text-xs text-neutral-400 font-mono">Control up to 5 slide banners appearing in rotation page hero.</p>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Grid of existing banners */}
      <div className="mt-6 flex flex-col gap-3">
        {banners.map((url, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-black/60"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-neutral-500 w-4">#{index + 1}</span>
              <img
                src={url}
                alt={`Banner Slide ${index + 1}`}
                className="w-24 h-12 object-cover rounded-md border border-white/10"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-neutral-400 font-mono truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                {url.startsWith("data:") ? "custom_upload_file.jpg" : url.split("/").pop()}
              </span>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              {/* Prioritise order */}
              <button
                disabled={index === 0}
                onClick={() => moveBanner(index, "up")}
                className="p-1.5 rounded bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                title="Move Up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                disabled={index === banners.length - 1}
                onClick={() => moveBanner(index, "down")}
                className="p-1.5 rounded bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                title="Move Down"
              >
                <ArrowDown size={14} />
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="p-1.5 rounded bg-rose-950/20 border border-rose-500/10 text-rose-400 hover:bg-rose-900/30 cursor-pointer ml-2"
                title="Delete Banner"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload area if banner limits are not exceeded */}
      {banners.length < 5 ? (
        <div className="mt-6">
          <label
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
              dragActive
                ? "border-violet-500 bg-violet-600/5"
                : "border-white/10 bg-black/30 hover:border-violet-500/20 hover:bg-white/[0.01]"
            }`}
          >
            <input type="file" className="hidden" accept="image/*" onChange={handleChange} disabled={uploading} />
            <div className="flex items-center gap-3 p-4">
              {uploading ? (
                <RefreshCw size={18} className="text-violet-400 animate-spin" />
              ) : (
                <Upload size={18} className="text-neutral-500" />
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs font-mono font-bold text-neutral-300">
                  {uploading ? "Broadcasting Stream..." : "Append Slide Banner"}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Drag background banner file (Mime: JPG, PNG, WEBP. Max 2MB)
                </span>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="mt-5 text-[10px] font-mono text-center text-amber-500/70 border border-amber-500/15 bg-amber-500/5 p-3 rounded-xl">
          Banner limits reached. Erase active slides to append new backgrounds.
        </div>
      )}
    </div>
  );
}
