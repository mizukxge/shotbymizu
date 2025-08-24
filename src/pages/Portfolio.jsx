import React, { useEffect, useMemo, useState } from "react";
import { GENRES } from "../config/genres.js";
import { IMAGES } from "../data/images.js";
import { Masonry } from "../components/Masonry.jsx";
import { SITE } from "../config/site.js";
import { Head } from "../components/Head.jsx";

const ALL_KEY = "all";

export default function PortfolioPage() {
  const [genre, setGenre] = useState(ALL_KEY);

  // Build the "all" list in the same order as GENRES
  const allItems = useMemo(() => {
    return GENRES.flatMap((g) => IMAGES[g.key] || []);
  }, []);

  const items = genre === ALL_KEY ? allItems : (IMAGES[genre] || []);

  // --- Theme detection (match Home/Projects approach) ---
  const getIsDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const [isDark, setIsDark] = useState(getIsDark());

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setIsDark(html.classList.contains("dark"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // Thin 1px outline that adapts to theme
  const outlineStyle = useMemo(
    () => ({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: isDark ? "var(--color-white)" : "var(--color-black)",
    }),
    [isDark]
  );

  // Reusable button renderer to keep styles consistent
  const renderFilterButton = (key, label) => {
    const selected = genre === key;

    if (selected) {
      // Filled style — black in light, white in dark
      return (
        <button
          key={key}
          onClick={() => setGenre(key)}
          className={[
            "rounded-xl px-3 py-1 text-sm",
            "cursor-pointer transition-colors duration-200",
            "transform hover:scale-[1.02] active:scale-[0.99]",
            isDark
              ? "bg-white text-black"
              : "bg-black text-white",
            "focus:outline-none focus:ring-2",
            isDark ? "focus:ring-white/70" : "focus:ring-black/70",
          ].join(" ")}
        >
          {label}
        </button>
      );
    }

    // Outlined style — transparent fill, theme-aware text + hover fill swap
    return (
      <button
        key={key}
        onClick={() => setGenre(key)}
        style={outlineStyle}
        className={[
          "rounded-xl px-3 py-1 text-sm bg-transparent",
          "cursor-pointer transition-colors duration-200",
          "transform hover:scale-[1.02] active:scale-[0.99]",
          isDark
            ? "text-white hover:bg-white hover:text-black"
            : "text-black hover:bg-black hover:text-white",
          "focus:outline-none focus:ring-2",
          isDark ? "focus:ring-white/70" : "focus:ring-black/70",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  // SEO keywords
  const pageKeywords =
    genre === ALL_KEY ? ["all", ...SITE.keywords] : [genre, ...SITE.keywords];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Head title="Portfolio" keywords={pageKeywords} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {renderFilterButton(ALL_KEY, "All")}
        {GENRES.map((g) => renderFilterButton(g.key, g.label))}
      </div>

      {/* Grid */}
      <Masonry
        items={items}
        watermark
        columnClass="columns-1 sm:columns-2 lg:columns-3 gap-6"
      />

      <p className="mt-8 text-sm opacity-70">
        5–10 images per gallery, mixed orientations, responsive & lazy-loaded.
      </p>
    </main>
  );
}
