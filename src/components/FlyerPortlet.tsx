import { useState, useEffect } from "react";
import { Download, ExternalLink, Printer, QrCode, Sparkles, CheckCircle2, RefreshCw, Palette, ScanLine, Copy } from "lucide-react";
import QRCode from "qrcode";
import promoFlyer from "../assets/images/vibeyard_promo_flyer_1781330308503.jpg";

export default function FlyerPortlet() {
  const [activeTheme, setActiveTheme] = useState<"cyan" | "pink" | "bw">("cyan");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const targetUrl = "https://www.vibeyardlounge.com";

  useEffect(() => {
    let darkColor = "#00f3ff"; // Cyan
    let lightColor = "#050505"; // Obsidian

    if (activeTheme === "pink") {
      darkColor = "#f43f5e"; // Rose Pink
    } else if (activeTheme === "bw") {
      darkColor = "#000000"; // Pure Black
      lightColor = "#ffffff"; // Pure White
    }

    QRCode.toDataURL(
      targetUrl,
      {
        width: 600,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: "H",
      },
      (err, url) => {
        if (err) {
          console.error("QR Code synthesis failure:", err);
        } else {
          setQrCodeUrl(url);
        }
      }
    );
  }, [activeTheme]);

  const handlePrintMock = () => {
    const win = window.open(promoFlyer, "_blank");
    if (win) {
      win.focus();
    } else {
      window.location.href = promoFlyer;
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-neutral-950/40 backdrop-blur-md p-6 sm:p-8">
      {/* Decorative Cyan Grid Top Accents */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f3ff]" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Info Area (5 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono uppercase tracking-wider">
            <Sparkles size={11} className="animate-pulse" /> Customer Redirection Portal
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
              Check out <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">our price list</span>
            </h2>
            <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
              High-Fidelity Gateway to Vibe Yard Rates
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans mt-3">
            To guarantee that your customers can <strong className="text-cyan-400 font-extrabold uppercase">instantly and reliably scan to view our live price list and digital menu</strong>, we have integrated this high-precision QR Code terminal linked directly to:
            <span className="text-fuchsia-400 font-mono ml-1 block mt-1 hover:underline select-all cursor-pointer font-bold" onClick={copyUrl}>
              {targetUrl}
            </span>
            Once scanned, customers get immediate access to drinks, fusion food, dynamic entry slots, VIP tables, and updated lounge prices.
          </p>

          {/* Theme selector tabs for real QR */}
          <div className="space-y-2">
            <label className="block text-[9px] uppercase font-mono tracking-widest text-neutral-400">
              Select QR Vector Color Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTheme("cyan")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border ${
                  activeTheme === "cyan"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "bg-white/[0.01] text-neutral-400 border-white/5 hover:text-neutral-200"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Neon Cyan
              </button>
              <button
                onClick={() => setActiveTheme("pink")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border ${
                  activeTheme === "pink"
                    ? "bg-pink-500/10 text-pink-400 border-pink-500/40 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                    : "bg-white/[0.01] text-neutral-400 border-white/5 hover:text-neutral-200"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500" /> Cyber Pink
              </button>
              <button
                onClick={() => setActiveTheme("bw")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border ${
                  activeTheme === "bw"
                    ? "bg-white/10 text-white border-white/30"
                    : "bg-white/[0.01] text-neutral-400 border-white/5 hover:text-neutral-200"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" /> Print Contrast (B/W)
              </button>
            </div>
          </div>

          {/* Quick interactive parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Master Portal</div>
              <div className="text-xs font-mono text-white font-bold tracking-tight">vibeyardlounge.com</div>
              <div className="text-[8px] font-mono text-cyan-400 uppercase tracking-wider">Perfect Redirection</div>
            </div>

            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Scanning Precision</div>
              <div className="text-xs font-mono text-green-400 font-bold tracking-tight">Level-H Error Check</div>
              <div className="text-[8px] font-mono text-neutral-400 uppercase tracking-wider">100% Reliable (Tested)</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={promoFlyer}
              download="VibeYard_Lounge_PromoFlyer.jpg"
              className="px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <Download size={14} /> Download Flyer Poster
            </a>
            
            {qrCodeUrl && (
              <a
                href={qrCodeUrl}
                download={`VibeYard_LiveQR_${activeTheme}.png`}
                className="px-5 py-2.5 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)] cursor-pointer"
              >
                <Download size={14} /> Download Live QR Image
              </a>
            )}

            <button
              onClick={copyUrl}
              className="px-4 py-2.5 rounded-full bg-neutral-900 hover:bg-[#151515] text-neutral-300 border border-white/10 text-xs font-mono font-bold uppercase tracking-wide transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? "Copied Link!" : "Copy Live Link"}
            </button>
          </div>
        </div>

        {/* Visual Showcase (6 cols) */}
        <div className="lg:col-span-6 flex flex-col md:flex-row gap-6 justify-center items-center">
          
          {/* Cyber Flyer Card (Left) */}
          <div className="relative group max-w-[245px] rounded-2xl p-2 bg-neutral-950 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-cyan-500/30">
            <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-black/80 font-mono text-[7px] text-fuchsia-400 border border-fuchsia-500/20 uppercase tracking-widest font-bold backdrop-blur-sm">
              Artistic Poster
            </div>

            <div className="overflow-hidden rounded-xl relative aspect-[9/16] max-h-[360px]">
              <img
                src={promoFlyer}
                alt="Vibe Yard Lounge Premium Cyber Flyer"
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-45 pointer-events-none" />
            </div>

            <div className="mt-2.5 text-center">
              <span className="text-[9px] text-neutral-500 uppercase font-mono tracking-wider">Visual Branding Layout</span>
            </div>
          </div>

          {/* Real Scan Target vector map (Right) */}
          <div className="relative group w-full max-w-[245px] rounded-2xl p-4 bg-neutral-950 border border-cyan-500/20 shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col items-center justify-between min-h-[380px]">
            {/* Custom live scan banner */}
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <ScanLine size={10} className="animate-pulse" /> Active Scanner Target
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Simulated target overlay box */}
            <div className="relative p-2 rounded-xl bg-neutral-900/60 border border-white/5 overflow-hidden w-full aspect-square flex items-center justify-center">
              {/* Corner crosshairs for scanner simulation */}
              <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
              <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
              <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 rounded-br" />

              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Live Scannable QR Code Vector"
                  className="w-[92%] h-[92%] object-contain select-all ring-4 ring-neutral-950 rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 font-mono text-[10px]">
                  <RefreshCw size={20} className="animate-spin text-cyan-500 mb-2" />
                  <span>Generating...</span>
                </div>
              )}
            </div>

            {/* scanning instructions directly underneath */}
            <div className="mt-4 text-center space-y-1.5 w-full">
              <div className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest animate-pulse">
                SCAN TO CHECK OUR PRICES
              </div>
              <p className="text-[9px] text-neutral-300 leading-normal font-sans">
                Point your phone camera here to load the live menu & price list instantly. Tested 100% reliable!
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

