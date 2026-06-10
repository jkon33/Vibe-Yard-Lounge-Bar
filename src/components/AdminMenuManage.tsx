import { MenuItem } from "../types";
import { Plus, Edit3, Trash2, Search, GlassWater, Flame } from "lucide-react";
import { useState } from "react";

interface AdminMenuManageProps {
  menuItems: MenuItem[];
  onAddClick: () => void;
  onEditClick: (item: MenuItem) => void;
  onDeleteClick: (id: string) => void;
}

export default function AdminMenuManage({
  menuItems,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: AdminMenuManageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Drink" | "Food">("All");

  // Filtering logic
  const filtered = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="admin-menu-management" className="p-6 rounded-2xl border border-white/5 bg-neutral-950/40 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-sans font-extrabold text-white tracking-tight">Vibe Catalog Operations</h3>
          <p className="text-xs text-neutral-400 font-mono">Create, update, or remove active consumable elements.</p>
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-mono font-semibold transition shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} /> Establish Consolidated Asset
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search catalogs cataloging keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Category Controls */}
        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
          {(["All", "Drink", "Food"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                categoryFilter === cat
                  ? "bg-violet-600 text-white font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {cat === "All" ? "Combined" : cat === "Drink" ? "Drinks" : "Foods"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="mt-6 overflow-hidden border border-white/5 rounded-xl bg-black/30">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-black/50 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="px-5 py-3.5">Consumable Asset</th>
                <th className="px-5 py-3.5">Class</th>
                <th className="px-5 py-3.5">Regular Rate</th>
                <th className="px-5 py-3.5 text-amber-500">VIP Rate</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs font-mono text-neutral-500">
                    No matching catalog entries detected.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id || item.id} className="text-xs hover:bg-white/[0.01] transition-colors duration-200">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col max-w-xs">
                          <span className="font-sans font-extrabold text-white text-sm">{item.name}</span>
                          <span className="text-neutral-500 truncate mt-0.5 font-mono">{item.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                          item.category === "Drink"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {item.category === "Drink" ? <GlassWater size={10} /> : <Flame size={10} />}
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-neutral-300">
                      ${item.regularPrice.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 font-mono font-extrabold text-amber-300">
                      ${item.vipPrice.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditClick(item)}
                          className="p-1.5 rounded bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white transition hover:border-violet-500/30 cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(item._id || item.id || "")}
                          className="p-1.5 rounded bg-rose-950/20 border border-rose-500/10 text-rose-400 hover:bg-rose-900/40 transition cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
