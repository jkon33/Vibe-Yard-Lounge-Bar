import { useState, useEffect } from "react";
import { MenuItem, SiteConfig } from "../types";
import { apiService, createWebSocketConnection } from "../services/api";
import LogoUpload from "../components/LogoUpload";
import BannerUpload from "../components/BannerUpload";
import AdminMenuManage from "../components/AdminMenuManage";
import MenuFormModal from "../components/MenuFormModal";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, LogOut, RefreshCw, Layers, Layout, AlertCircle, Sparkles, Sliders, QrCode } from "lucide-react";
import FlyerPortlet from "../components/FlyerPortlet";

interface AdminDashboardProps {
  onLogoutSuccess: () => void;
}

export default function AdminDashboard({ onLogoutSuccess }: AdminDashboardProps) {
  const { state: authState, logout } = useAuth();
  
  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ logoUrl: "Vibe Yard", banners: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs / Active views
  const [activeTab, setActiveTab] = useState<"menu" | "site" | "flyer">("menu");

  // Modal State for Menu item mutation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Status alerts feedback
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch all backend data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [menuRes, configRes] = await Promise.all([
        apiService.getMenu(),
        apiService.getSiteConfig(),
      ]);

      if (menuRes.success && menuRes.data) {
        setMenuItems(menuRes.data);
      } else {
        setError(menuRes.message || "Failed to load database catalogue.");
      }

      if (configRes.success && configRes.data) {
        setSiteConfig(configRes.data);
      }
    } catch (err) {
      console.error("Dashboard pull failure:", err);
      setError("Network channel synchronization collapsed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Setup client listener
    const cleanupSocket = createWebSocketConnection(
      () => {
        // Silent catalog synchronized updates on socket notify
        apiService.getMenu().then((res) => {
          if (res.success && res.data) setMenuItems(res.data);
        });
      },
      (payload) => {
        if (payload) {
          setSiteConfig({
            logoUrl: payload.logoUrl,
            banners: payload.banners || [],
          });
        }
      }
    );

    return () => {
      cleanupSocket();
    };
  }, []);

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Form submission: CREATE or UPDATE
  const handleFormSubmit = async (itemData: any): Promise<boolean> => {
    try {
      let res;
      if (editingItem) {
        // Update model
        res = await apiService.updateMenuItem(editingItem._id || editingItem.id || "", itemData);
      } else {
        // Create model
        res = await apiService.createMenuItem(itemData);
      }

      if (res.success) {
        triggerToast("success", editingItem ? "Category asset reconciled." : "New consumable asset deployed.");
        loadDashboardData(); // Reload catalog
        return true;
      } else {
        triggerToast("error", res.message || "Mainframe transaction denied.");
        return false;
      }
    } catch (err) {
      console.error("Submission trigger error:", err);
      triggerToast("error", "Exception thrown by database driver.");
      return false;
    }
  };

  // Delete Action
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you certain you wish to purge this consumable asset from catalog list?")) return;
    try {
      const res = await apiService.deleteMenuItem(id);
      if (res.success) {
        triggerToast("success", "Consumable catalog entry successfully purged.");
        loadDashboardData();
      } else {
        triggerToast("error", res.message || "Failed to purge asset.");
      }
    } catch (err) {
      console.error("Purge failure:", err);
      triggerToast("error", "Network purging pathway error.");
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogoutSuccess();
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200">
      {/* Glow Lights */}
      <div className="fixed top-0 right-1/4 w-[30w] h-[30w] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Panel */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="p-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-lg">
              <ShieldCheck size={16} />
            </span>
            <div className="flex flex-col">
              <h1 className="text-sm font-sans font-black uppercase tracking-tight text-white leading-none">
                Mainframe Console
              </h1>
              <span className="text-[9px] font-mono text-neutral-500 mt-1 uppercase">
                Vibe Yard Management Server
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-[10px] font-mono text-neutral-400 px-3 py-1 rounded bg-white/[0.02] border border-white/5">
              Secure Session: <span className="text-violet-400 font-bold">{authState.username}</span>
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/20 rounded-xl text-xs font-mono text-rose-400 transition cursor-pointer"
            >
              <LogOut size={13} /> Exit Console
            </button>
          </div>
        </div>
      </header>

      {/* Content wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <div className="p-4 rounded-2xl border border-white/5 bg-neutral-950/40 backdrop-blur-sm space-y-2">
              <span className="block text-[10px] uppercase font-mono tracking-widest text-neutral-500 px-2 mb-3">
                Command Panels
              </span>

              <button
                onClick={() => setActiveTab("menu")}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer text-left ${
                  activeTab === "menu"
                    ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                <Layers size={14} /> Catalog Database
              </button>

              <button
                onClick={() => setActiveTab("site")}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer text-left ${
                  activeTab === "site"
                    ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                <Layout size={14} /> Brand Properties
              </button>

              <button
                onClick={() => setActiveTab("flyer")}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer text-left ${
                  activeTab === "flyer"
                    ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                <QrCode size={14} /> Promote & Flyer Hub
              </button>
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-white/5 bg-neutral-950/20 text-[9px] font-mono text-neutral-500 space-y-2">
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase">
                <Sliders size={12} /> Status Monitor
              </div>
              <div className="flex items-center justify-between">
                <span>Database Client:</span>
                <span className="text-emerald-400 font-bold">MUTATING</span>
              </div>
              <div className="flex items-center justify-between">
                <span>WS Broadcaster:</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate limiting block:</span>
                <span className="text-violet-400 font-bold">SECURED</span>
              </div>
            </div>
          </aside>

          {/* Active Panel Stage */}
          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 font-mono text-neutral-500">
                <RefreshCw size={24} className="animate-spin text-violet-500" />
                <span>Pulling latest properties...</span>
              </div>
            ) : error ? (
              <div className="py-12 p-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 max-w-lg mx-auto text-center font-mono">
                <AlertCircle size={24} className="text-rose-500 mx-auto" />
                <p className="mt-3 text-sm text-rose-300">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="mt-4 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer"
                >
                  Reload Pathways
                </button>
              </div>
            ) : (
              <>
                {activeTab === "menu" ? (
                  <AdminMenuManage
                    menuItems={menuItems}
                    onAddClick={() => {
                      setEditingItem(null);
                      setIsModalOpen(true);
                    }}
                    onEditClick={(item) => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    onDeleteClick={handleDeleteItem}
                  />
                ) : activeTab === "site" ? (
                  <div className="space-y-6">
                    {/* Logo upload wrapper */}
                    <LogoUpload
                      currentLogo={siteConfig.logoUrl}
                      onLogoUpdated={(logo) => {
                        setSiteConfig((prev) => ({ ...prev, logoUrl: logo }));
                        triggerToast("success", "Brand Identity Logo synchronized.");
                      }}
                    />

                    {/* Sliding banners upload wrapper */}
                    <BannerUpload
                      banners={siteConfig.banners}
                      onBannersUpdated={(banners) => {
                        setSiteConfig((prev) => ({ ...prev, banners }));
                        triggerToast("success", "Banner rotation order synchronized.");
                      }}
                    />
                  </div>
                ) : (
                  <FlyerPortlet />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Item creation / updating modal */}
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSubmit={handleFormSubmit}
      />

      {/* Floating alert Toasts */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 border rounded-xl text-xs font-mono font-medium flex items-center gap-3 shadow-xl backdrop-blur-md max-w-sm ${
            toast.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/20 text-emerald-400 shadow-[0_5px_25px_rgba(16,185,129,0.15)]"
              : "bg-rose-950/80 border-rose-500/20 text-rose-400 shadow-[0_5px_25px_rgba(239,68,68,0.15)]"
          }`}
        >
          <div className={`h-2 w-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-emerald-400 animate-pulse" : "bg-rose-400 animate-pulse"}`} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
