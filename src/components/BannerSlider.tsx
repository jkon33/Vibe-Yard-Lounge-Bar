import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerSliderProps {
  banners: string[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // changes every 5 seconds
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) {
    return (
      <div className="w-full h-80 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-500 font-mono text-sm">
        [CYBER FEED TEMPORARILY OFFLINE]
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] bg-neutral-950/60">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={banners[currentIndex]}
          alt={`Slider Banner ${currentIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      {/* Cyber Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/85 via-transparent to-[#050505]/40 pointer-events-none" />

      {/* Slide Text overlay */}
      <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10 pointer-events-none max-w-lg">
        <span className="text-fuchsia-500 text-xs font-black tracking-[0.4em] uppercase mb-2 block">
          Featured Experience
        </span>
        <h2 className="text-2xl md:text-5xl font-display font-black tracking-tighter text-white uppercase leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          NEON <span className="text-cyan-400">YARD</span> MIXOLOGY
        </h2>
        <p className="mt-3 text-xs md:text-sm text-neutral-300 leading-relaxed border-l-2 border-cyan-500 pl-4 font-mono max-w-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Experience the future of nightlife with our signature synth-brews and high-fidelity atmosphere.
        </p>
      </div>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            id="slider-btn-prev"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/70 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            id="slider-btn-next"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/70 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 right-6 flex gap-2 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-8 bg-cyan-500 shadow-[0_0_10px_#00f3ff]"
                    : "w-2 bg-neutral-700 hover:bg-neutral-600"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
