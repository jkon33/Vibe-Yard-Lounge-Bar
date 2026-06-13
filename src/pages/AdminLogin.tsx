import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import { ArrowLeft, Key, User, Terminal, AlertTriangle, ShieldCheck, RefreshCw, Mail, CheckCircle } from "lucide-react";

interface AdminLoginProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onBackToHome, onLoginSuccess }: AdminLoginProps) {
  const { login } = useAuth();
  
  // Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // View Control
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Passsword Recovery States
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please input secure identifiers.");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ username: username.trim(), password: password.trim() });
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message || "Mainframe rejected credentials. Please check logs.");
      }
    } catch (err) {
      console.error("Login trigger failed:", err);
      setError("Failed to establish server authentication pathway.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setRecoverySuccess(null);
    setRecoveryLink(null);

    if (!recoveryEmail.trim()) {
      setError("Please key in your registered administrator email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.forgotPassword(recoveryEmail.trim());
      if (result.success) {
        setRecoverySuccess(result.data?.message || result.message || "Bypass request has been processed.");
        if (result.data?.devResetLink) {
          setRecoveryLink(result.data.devResetLink);
        }
      } else {
        setError(result.message || "Bypass request failed.");
      }
    } catch (err) {
      console.error("Forgot password flow error:", err);
      setError("Could not trace authorization dispatcher service.");
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

      {/* Floating navigation anchor to guest view */}
      <button
        onClick={onBackToHome}
        className="absolute top-6 left-6 flex items-center gap-1.5 px-4 py-2 border border-cyan-500/20 hover:border-cyan-400/50 bg-[#050505]/65 hover:bg-cyan-500/10 rounded-full text-xs font-mono text-neutral-300 transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.1)]"
      >
        <ArrowLeft size={14} /> Back to Lounge Feed
      </button>

      {/* Futuristic Box structure */}
      <div className="relative w-full max-w-sm rounded-2xl border border-cyan-500/20 bg-neutral-950/70 p-6 md:p-8 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        {/* Glow Header indicator */}
        <div className="absolute -top-[1px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#00f3ff]" />

        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Terminal size={22} />
          </div>
          <h2 className="text-lg font-sans font-black tracking-tight text-white uppercase leading-none">
            {isForgotPassword ? "RECOVERY GATEWAY" : "Mainframe Gateway"}
          </h2>
          <p className="text-[10px] text-neutral-500 font-mono mt-1.5 uppercase tracking-wider">
            {isForgotPassword ? "Credential clearance request" : "Restricted Perimeter Auth."}
          </p>
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-mono flex items-start gap-2 leading-relaxed">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-500 animate-pulse" />
            <div>
              <span className="font-bold">ACCESS EXCLUSION:</span> {error}
            </div>
          </div>
        )}

        {recoverySuccess && (
          <div className="mt-6 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono flex items-start gap-2 leading-relaxed">
            <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <span className="font-bold">DISPATCH SUCCESS:</span> {recoverySuccess}
            </div>
          </div>
        )}

        {/* Form panel */}
        {!isForgotPassword ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[9px] uppercase font-mono tracking-widest text-neutral-500 mb-1">
                Terminal User ID
              </label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900/55 border border-white/10 rounded-xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 transition duration-300"
                  placeholder="administrator"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[9px] uppercase font-mono tracking-widest text-neutral-500">
                  Cipher Passphrase
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsForgotPassword(true);
                  }}
                  className="text-[9px] uppercase font-mono tracking-wider text-fuchsia-400 hover:text-fuchsia-300 transition cursor-pointer"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900/55 border border-white/10 rounded-xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 transition duration-300"
                  placeholder="••••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-6 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin text-white" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Authorize Session
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[9px] uppercase font-mono tracking-widest text-neutral-500 mb-1">
                Secure Perimeter Contact (Email)
              </label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900/55 border border-white/10 rounded-xl text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 transition duration-300"
                  placeholder="admin@vibeyardlounge.com"
                />
              </div>
            </div>

            {recoveryLink && (
              <div className="p-3 rounded-xl border border-dashed border-fuchsia-400 bg-fuchsia-500/5 text-center mt-2 animate-pulse">
                <p className="text-[10px] font-mono text-fuchsia-300 font-bold uppercase tracking-wider mb-1">🔧 Sandbox Clearance Link</p>
                <a 
                  href={recoveryLink} 
                  className="text-xs text-cyan-400 underline font-mono break-all hover:text-cyan-300 transition"
                >
                  {recoveryLink}
                </a>
                <p className="text-[8px] text-neutral-500 mt-1 uppercase font-mono">Click link above to directly re-key password</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-6 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin text-white" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Clear Bypass Link
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setRecoverySuccess(null);
                  setRecoveryLink(null);
                  setIsForgotPassword(false);
                }}
                className="text-[9px] uppercase font-mono tracking-wider text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              >
                Return to Login Gateway
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 p-3 rounded-lg bg-white/[0.01] border border-white/5 text-[9px] font-mono text-neutral-500 leading-relaxed text-center uppercase tracking-wider">
          Brute force logging active. Requests trace rate limits.
        </div>
      </div>
    </div>
  );
}

