import React, { useState } from "react";
import { apiService } from "../services/api";
import { ArrowLeft, Key, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

interface AdminResetPasswordProps {
  token: string;
  onBackToLogin: () => void;
}

export default function AdminResetPassword({ token, onBackToLogin }: AdminResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please input all secure key parameters.");
      return;
    }

    if (password.length < 6) {
      setError("Passphrase key must consist of at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Credential verification mismatch. Keys do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.resetPassword({ token, newPassword: password });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || "Failed to finalize credential re-key sequence.");
      }
    } catch (err) {
      console.error("Password reset action failed:", err);
      setError("Network transport disruption. Failed to connect to mainframe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#e0e0e0] flex items-center justify-center p-4 overflow-hidden selection:bg-cyan-500/30 selection:text-white">
      {/* Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#00f3ff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Background neon lights */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating back button */}
      <button
        onClick={onBackToLogin}
        className="absolute top-6 left-6 flex items-center gap-1.5 px-4 py-2 border border-cyan-500/20 hover:border-cyan-400/50 bg-[#050505]/65 hover:bg-cyan-500/10 rounded-full text-xs font-mono text-neutral-300 transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.1)]"
      >
        <ArrowLeft size={14} /> Back to Entry Point
      </button>

      {/* Futuristic Box */}
      <div className="relative w-full max-w-sm rounded-2xl border border-cyan-500/20 bg-neutral-950/70 p-6 md:p-8 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        {/* Glow Header indicator */}
        <div className="absolute -top-[1px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#00f3ff]" />

        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-2xl mb-4 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
            <Key size={22} />
          </div>
          <h2 className="text-lg font-sans font-black tracking-tight text-white uppercase leading-none">
            RE-KEY CIPHER
          </h2>
          <p className="text-[10px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">
            Authorize new perimeter credential passphrase
          </p>
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-mono flex items-start gap-2 leading-relaxed">
            <ShieldAlert size={15} className="shrink-0 mt-0.5 text-rose-500 animate-pulse" />
            <div>
              <span className="font-bold">SYSTEM ALERT:</span> {error}
            </div>
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-6 text-center">
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono flex items-start gap-2 leading-relaxed text-left">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <span className="font-bold font-sans">CIPHER RE-KEY COMPLETE:</span> The administrator password has been fully updated in the master registry.
              </div>
            </div>
            
            <button
              onClick={onBackToLogin}
              className="w-full py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              Sign In with New Key
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[9px] uppercase font-mono tracking-widest text-neutral-500 mb-1">
                New Cipher Key
              </label>
              <div className="relative">
                <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  required
                  disabled={loading || !token}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900/55 border border-white/10 rounded-xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 transition duration-300"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase font-mono tracking-widest text-neutral-500 mb-1">
                Verify Cipher Key
              </label>
              <div className="relative">
                <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  required
                  disabled={loading || !token}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900/55 border border-white/10 rounded-xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 transition duration-300"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {!token && (
              <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[9px] font-mono text-rose-400 uppercase tracking-wide leading-relaxed text-center">
                Attention: Reset Token missing or invalid. Please check link format.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-2.5 mt-6 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin text-white" />
              ) : (
                "Update Mainframe Password"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 p-3 rounded-lg bg-white/[0.01] border border-white/5 text-[9px] font-mono text-neutral-500 leading-relaxed text-center uppercase tracking-wider">
          Token expiration parameters enforced. Reset session duration: 60M.
        </div>
      </div>
    </div>
  );
}
