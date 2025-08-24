// src/components/Hero.jsx
import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full bg-black overflow-hidden flex items-center justify-center h-auto md:h-screen">
      {/* Hero Image */}
      <motion.img
        src="/hero.jpg"
        alt="Hero"
        className="w-full h-auto md:h-full object-contain md:object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Gradient Overlay (only covers in md+ mode) */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Centered brand name */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 1.0, ease: "easeOut" }}
      >
        <h1
          className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-widest uppercase font-mono text-center px-4"
          style={{
            textShadow: `
              0 6px 25px rgba(0,0,0,0.9),
              0 4px 15px rgba(0,0,0,0.8),
              0 2px 8px rgba(0,0,0,0.7)
            `,
          }}
          aria-label="shotbymizu"
        >
          shotbymizu
        </h1>
      </motion.div>
    </section>
  );
}
