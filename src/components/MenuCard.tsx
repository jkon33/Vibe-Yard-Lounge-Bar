import { motion } from "motion/react";
import { MenuItem } from "../types";
import { Sparkles, GlassWater, Flame } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
  key?: string;
}

export default function MenuCard({ item }: MenuCardProps) {
  const isDrink = item.category === "Drink";

  return (
    <motion.div
      id={`menu-card-${item._id || item.id}`}
      layout
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-neutral-950/60 p-5 backdrop-blur-md transition-all duration-300 md:p-6 ${
        isDrink
          ? "hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
          : "hover:border-fuchsia-500/30 hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]"
      }`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
    >
      {/* Glow Backing Accent */}
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full blur-[40px] transition-all duration-300 ${
        isDrink
          ? "bg-cyan-600/5 group-hover:bg-cyan-600/15"
          : "bg-fuchsia-600/5 group-hover:bg-fuchsia-600/15"
      }`} />

      <div>
        {/* Card Top: Image */}
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-white/10 bg-black/50">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {/* Category Tag */}
          <span
            className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border backdrop-blur-md ${
              isDrink
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                : "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30"
            }`}
          >
            {isDrink ? <GlassWater size={12} /> : <Flame size={12} />}
            {item.category}
          </span>
        </div>

        {/* Info */}
        <div className="mt-4">
          <h3 className={`text-lg font-sans font-extrabold text-white tracking-tight transition-colors duration-300 uppercase ${
            isDrink ? "group-hover:text-cyan-400" : "group-hover:text-fuchsia-400"
          }`}>
            {item.name}
          </h3>
          <p className="mt-2 text-xs text-neutral-400 font-mono leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* Pricing Section (Regular vs VIP) */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
        {/* Regular Price */}
        <div>
          <span className="block text-[9px] uppercase tracking-widest font-mono text-neutral-500">
            Regular Price
          </span>
          <span className="text-sm font-semibold text-neutral-400">₦{item.regularPrice.toFixed(2)}</span>
        </div>

        {/* Separator / Divider */}
        <div className="h-6 w-[1px] bg-white/5" />

        {/* VIP Price with Gilded Shimmer */}
        <div className="relative flex flex-col items-end">
          <span className="block text-[9px] uppercase tracking-widest font-mono text-amber-500/80 font-bold flex items-center gap-0.5 mb-1">
            <Sparkles size={10} className="animate-pulse" /> VIP Rate
          </span>
          
          <div className="relative overflow-hidden rounded px-2.5 py-0.5 bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.3)]">
            {/* Shimmer animation bar using pure CSS inside class */}
            <div className="absolute top-0 -inset-x-20 bottom-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2.5s_infinite]" />
            <span className="text-[11px] font-black text-black">
              ₦{item.vipPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
