import { useState, useEffect } from "react";
import { MenuItem, SiteConfig } from "../types";
import { apiService, createWebSocketConnection } from "../services/api";
import BannerSlider from "../components/BannerSlider";
import MenuCard from "../components/MenuCard";
import { Search, Sparkles, LogIn, RefreshCw, AlertCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HomeProps {
  onNavigateToLogin: () => void;
}

export default function Home({ onNavigateToLogin }: HomeProps) {
  // Stale-While-Revalidate Local Storage Cache Handlers for Instant Load
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const cached = localStorage.getItem("vibeyard_menu");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const cached = localStorage.getItem("vibeyard_config");
      return cached ? JSON.parse(cached) : { logoUrl: "Vibe Yard", banners: [] };
    } catch {
      return { logoUrl: "Vibe Yard", banners: [] };
    }
  });

  // Start with loading true only if there is nothing in the local cache yet,
  // making load instant for repeat accesses (mobile/tablet/desktop)
  const [loading, setLoading] = useState(() => !menuItems.length);
  const [error, setError] = useState<string | null>(null);

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Drink" | "Food">("All");

  // Real-time synchronization toast notifier
  const [syncToast, setSyncToast] = useState<{ message: string; visible: boolean } | null>(null);

  // Helper to determine if the customized logo is an actual image (Base64, relative root path, or external URL)
  const isLogoImage = (url: string) => {
    if (!url) return false;
    const lower = url.trim().toLowerCase();
    return (
      lower.startsWith("data:image/") ||
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("/") ||
      lower.includes("base64")
    );
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setError(null);
      
      const [menuRes, configRes] = await Promise.all([
        apiService.getMenu(),
        apiService.getSiteConfig(),
      ]);

      if (menuRes.success && menuRes.data) {
        setMenuItems(menuRes.data);
        try {
          localStorage.setItem("vibeyard_menu", JSON.stringify(menuRes.data));
        } catch (e) {
          console.warn("Local storage cache write issue:", e);
        }
      } else if (!menuItems.length) {
        setError(menuRes.message || "Could not retrieve menu elements.");
      }

      if (configRes.success && configRes.data) {
        setSiteConfig(configRes.data);
        try {
          localStorage.setItem("vibeyard_config", JSON.stringify(configRes.data));
        } catch (e) {
          console.warn("Local storage cache write issue:", e);
        }
      }
    } catch (err) {
      console.error("Home data pull failure:", err);
      if (!menuItems.length) {
        setError("Synchronisation with mainframe failed. Check network.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Establish WebSocket Connection for real-time updates
    const cleanupSocket = createWebSocketConnection(
      // On Menu Update callback
      (payload) => {
        // Redownload menu data to get true authoritative state
        apiService.getMenu().then((res) => {
          if (res.success && res.data) {
            setMenuItems(res.data);
            try {
              localStorage.setItem("vibeyard_menu", JSON.stringify(res.data));
            } catch (e) {
              console.warn("Local storage cache write issue:", e);
            }
            
            // Show real-time feedback toast
            let actMsg = "Mainframe sync: Consolidated catalogs refreshed.";
            if (payload?.action === "create") actMsg = `Fresh infusion appended: ${payload.item?.name}`;
            else if (payload?.action === "delete") actMsg = "Menu item retracted from active feed.";
            else if (payload?.action === "update") actMsg = `Adjustments applied to: ${payload.item?.name}`;

            setSyncToast({ message: actMsg, visible: true });
            setTimeout(() => setSyncToast((prev) => (prev ? { ...prev, visible: false } : null)), 3500);
          }
        });
      },
      // On Config Update callback
      (payload) => {
        if (payload) {
          const updatedConfig = {
            logoUrl: payload.logoUrl,
            banners: payload.banners || [],
          };
          setSiteConfig(updatedConfig);
          try {
            localStorage.setItem("vibeyard_config", JSON.stringify(updatedConfig));
          } catch (e) {
            console.warn("Local storage cache write issue:", e);
          }
          setSyncToast({ message: "Dashboard layout adjusted by admin.", visible: true });
          setTimeout(() => setSyncToast((prev) => (prev ? { ...prev, visible: false } : null)), 3500);
        }
      }
    );

    return () => {
      cleanupSocket();
    };
  }, []);

  // Filter lists
  const filteredItems = menuItems.filter((it) => {
    const matchesKeyword =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || it.category === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] selection:bg-cyan-500/30 selection:text-white pb-12 relative overflow-hidden">
      {/* Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#00f3ff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Glow Ambient Lights */}
      <div className="fixed top-0 left-1/4 w-[40vw] h-[40vw] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-[35vw] h-[35vw] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar header */}
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Dynamic Logo banner */}
            <div className="flex flex-col">
              {isLogoImage(siteConfig.logoUrl) ? (
                <img
                  src={siteConfig.logoUrl}
                  alt="Logo"
                  className="max-h-12 w-auto max-w-[145px] sm:max-w-[200px] object-contain filter drop-shadow-[0_0_8px_rgba(0,243,255,0.35)]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 uppercase font-sans">
                  {siteConfig.logoUrl || "Vibe Yard"} <span className="text-cyan-400">Lounge</span>
                </span>
              )}
            </div>
            
            <span className="hidden md:inline-block h-4 w-[1px] bg-white/10 ml-2" />
            <span className="hidden md:inline-block text-[9px] uppercase font-mono tracking-widest text-neutral-500">
              Lounge & Bar
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToLogin}
              className="px-5 py-2 border border-fuchsia-500/50 rounded-full text-xs font-bold uppercase tracking-widest text-fuchsia-300 bg-fuchsia-500/10 hover:bg-fuchsia-500/25 shadow-[0_0_12px_rgba(217,70,239,0.25)] transition duration-300 cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Banner Carousel */}
        <BannerSlider banners={siteConfig.banners} />

        {/* Benefits Panel / VIP Spotlight */}
        <section className="mt-12 p-6 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-amber-500/[0.02] to-yellow-500/[0.02] backdrop-blur-sm shadow-[0_0_30px_rgba(245,158,11,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-extrabold tracking-widest">
              <Sparkles size={14} className="animate-spin duration-300)" /> Executive Priority Rate
            </div>
            <h2 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight text-white mt-1">
              Elevate Your Senses with Vibe Yard VIP Status
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1.5 leading-relaxed">
              Unlock the golden margin. VIP tier users enjoy premium discounts, early product access, and complimentary custom mixology reserves during events. Join today from our reception desk.
            </p>
          </div>
          <div className="flex rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-5 py-2.5 text-xs font-mono font-black uppercase tracking-wider text-center max-w-[160px] shrink-0 justify-center items-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            Up to 30% Off
          </div>
        </section>

        {/* Dynamic Filters & Search Block */}
        <section className="mt-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-sans tracking-tight font-black text-white uppercase">Menu Consumables Code</h2>
              <p className="text-xs text-neutral-500 font-mono">Filter and find exact food fusions and custom molecular drinks.</p>
            </div>

            {/* Controls panel */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search input */}
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search the menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Categorization triggers as rounded pill triggers */}
              <div className="flex gap-2">
                {(["All", "Drink", "Food"] as const).map((cat) => {
                  const isActive = selectedCategory === cat;
                  let activeClass = "bg-cyan-500 text-black";
                  if (cat === "Food") {
                    activeClass = "bg-fuchsia-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.3)]";
                  } else if (cat === "All" || cat === "Drink") {
                    activeClass = "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.3)]";
                  }

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-tighter transition-all cursor-pointer ${
                        isActive
                          ? `${activeClass} font-extrabold`
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {cat === "All" ? "All Items" : cat === "Drink" ? "Drinks" : "Food"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Catalog items results */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 font-mono text-neutral-500">
              <RefreshCw size={24} className="animate-spin text-violet-500" />
              <span>Aligning feed components...</span>
            </div>
          ) : error ? (
            <div className="py-24 text-center max-w-md mx-auto">
              <ShieldAlert size={32} className="text-rose-500 mx-auto" />
              <p className="mt-3 text-sm font-mono text-neutral-400">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 rounded-xl bg-violet-600/20 text-violet-400 text-xs font-mono border border-violet-500/20 hover:bg-violet-600/30 cursor-pointer"
              >
                Attempt Resync
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <MenuCard key={item._id || item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="py-24 text-center font-mono text-neutral-500 text-xs border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              Zero active menu segments matched the query.
            </div>
          )}
        </section>
      </main>

      {/* Bottom Status Bar Footer */}
      <footer className="mt-20 border-t border-white/5 bg-[#050505] py-8 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        <div className="flex gap-6 items-center">
          <span>Vibe Yard Lounge & Bar 2026</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="text-neutral-500">
            Website is designed by{" "}
            <a
              href="https://wa.link/ik6tzk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline decoration-cyan-400/30 hover:decoration-cyan-400 transition normal-case"
            >
              CodeNaija Limited
            </a>
          </span>
        </div>
      </footer>

      {/* Real-time sync feedback toast */}
      <AnimatePresence>
        {syncToast && syncToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3.5 rounded-xl border border-violet-500/20 bg-neutral-950/90 text-neutral-200 text-xs font-mono flex items-center gap-2.5 shadow-[0_10px_40px_rgba(139,92,246,0.3)] backdrop-blur-md max-w-sm"
          >
            <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
            <span>{syncToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
