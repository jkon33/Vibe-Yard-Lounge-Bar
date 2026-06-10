import React, { useState } from "react";
import { apiService } from "../services/api";
import { Upload, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface LogoUploadProps {
  currentLogo: string;
  onLogoUpdated: (newLogo: string) => void;
}

export default function LogoUpload({ currentLogo, onLogoUpdated }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const processFile = (file: File) => {
    // 1. Validate MIME type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFeedback({
        type: "error",
        message: "File type invalid. Only JPEG, PNG, and WEBP are permitted.",
      });
      return;
    }

    // 2. Validate Size (max 2MB)
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFeedback({
        type: "error",
        message: "File size exceeds 2MB limit.",
      });
      return;
    }

    setUploading(true);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Str = e.target?.result as string;
      
      const response = await apiService.updateLogo(base64Str);
      setUploading(false);

      if (response.success && response.data) {
        onLogoUpdated(response.data.logoUrl);
        setFeedback({
          type: "success",
          message: "Terminal logo updated synchronized.",
        });
      } else {
        setFeedback({
          type: "error",
          message: response.message || "Failed to transmit logo asset.",
        });
      }
    };

    reader.onerror = () => {
      setUploading(false);
      setFeedback({ type: "error", message: "Error reading binary contents." });
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

  return (
    <div id="logo-uploader" className="p-6 rounded-2xl border border-white/5 bg-neutral-950/40 backdrop-blur-md">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-sans font-extrabold text-white tracking-tight">Identity Customization</h3>
        <p className="text-xs text-neutral-400 font-mono">Upload a custom site logo / header title.</p>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Current Logo Preview */}
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/60 p-4 items-center justify-center h-32 md:col-span-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Live Logo preview</span>
          {currentLogo.startsWith("data:image") || currentLogo.startsWith("http") ? (
            <img src={currentLogo} alt="Logo" className="max-h-12 object-contain filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-xl font-sans font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 tracking-wider">
              {currentLogo || "Vibe Yard"}
            </span>
          )}
        </div>

        {/* Drag & Drop Area */}
        <div className="md:col-span-2">
          <label
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
              dragActive
                ? "border-violet-500 bg-violet-600/5"
                : "border-white/10 bg-black/30 hover:border-violet-500/20 hover:bg-white/[0.01]"
            }`}
          >
            <input type="file" className="hidden" accept="image/*" onChange={handleChange} disabled={uploading} />
            
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              {uploading ? (
                <RefreshCw size={24} className="text-violet-400 animate-spin" />
              ) : (
                <Upload size={24} className="text-neutral-500 group-hover:text-violet-400 transition-colors" />
              )}
              
              <div className="text-xs text-neutral-300 font-mono font-medium">
                {uploading ? "Broadcasting block..." : "Drag logo file here or click to browse"}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                MIME: JPG, PNG, WEBP (Max 2MB)
              </div>
            </div>
          </label>
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-4 p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {feedback.message}
        </div>
      )}
    </div>
  );
}
