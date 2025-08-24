// src/components/Masonry.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import LazyImage from "./LazyImage.jsx";

/**
 * Masonry (named export)
 *
 * - CSS Columns layout preserved (original look + consistent gutters)
 * - Preloads all images before revealing
 * - Measures each tile (top/left) to compute a true ROW-wise order for the fade-in
 * - One-by-one reveal with subtle fade + lift + scale
 * - Lightbox: no X button; click backdrop / Esc to close; ←/→ for navigation
 * - Arrow buttons now FORCE black in light mode and white in dark mode
 */
export function Masonry({
  items = [],
  columnClass = "columns-1 sm:columns-2 lg:columns-3 gap-6",
  seed,
  watermark = false, // reserved
}) {
  // Normalize incoming image objects
  const images = useMemo(
    () =>
      (items || []).map((it, i) => {
        const src = it?.src || it?.url || it?.image || "";
        const alt = it?.alt || it?.title || `Image ${i + 1}`;
        return { src, alt, ...it };
      }),
    [items, seed]
  );

  // Preload + visibility sequencing
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(() => images.map(() => false));

  // Refs for measuring tile positions
  const itemRefs = useRef([]);
  itemRefs.current = [];

  // Preload all images first
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setVisible(images.map(() => false));

    const sources = images.map((i) => i.src).filter(Boolean);
    const preload = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(src); // don't block on errors
        img.src = src;
      });

    Promise.all(sources.map(preload)).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [images]);

  // After ready & render, measure tiles and reveal row-by-row
  useEffect(() => {
    if (!ready) return;
    let raf1, raf2;
    const timers = [];

    const measureAndReveal = () => {
      // Measure each tile’s top/left
      const positions = images.map((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return { i, top: Number.POSITIVE_INFINITY, left: 0 };
        const rect = el.getBoundingClientRect();
        // Round to avoid sub-pixel jitter affecting sort order
        return { i, top: Math.round(rect.top), left: Math.round(rect.left) };
      });

      // Sort by top then left → row-wise order
      positions.sort((a, b) => (a.top - b.top) || (a.left - b.left));

      // Sequentially make them visible in that order
      positions.forEach((p, rank) => {
        const delay = 60 + rank * 110; // tweak cadence: base 60ms + 110ms per item
        const t = setTimeout(() => {
          setVisible((prev) => {
            if (prev[p.i]) return prev;
            const next = prev.slice();
            next[p.i] = true;
            return next;
          });
        }, delay);
        timers.push(t);
      });
    };

    // Double RAF to ensure layout is committed (columns need a paint)
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measureAndReveal);
    });

    const onResize = () => {
      // If the viewport resizes during sequence, we could recompute.
      // Keeping simple: we don't restart mid-sequence.
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
    };
  }, [ready, images.length]);

  // Lightbox state
  const [openIndex, setOpenIndex] = useState(null);

  // Scroll lock when modal is open
  useEffect(() => {
    if (openIndex !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [openIndex]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-5 w-5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Masonry container — CSS columns keep perfect guttering */}
      <div className={columnClass}>
        {images.map((img, i) => {
          const isVisible = visible[i];
          return (
            <button
              key={(img.src || "") + i}
              type="button"
              ref={(el) => (itemRefs.current[i] = el)}
              onClick={() => setOpenIndex(i)}
              aria-label={img.alt ? `Open image: ${img.alt}` : "Open image"}
              className={[
                // IMPORTANT for consistent gaps in a column layout:
                // - mb-6 = vertical gutter (match container gap-6)
                // - break-inside-avoid = prevent column breaks through an item
                "mb-6 break-inside-avoid block w-full group focus:outline-none",
                "transition-all duration-500 ease-out",
                // subtle lift + scale + fade (revealed row-wise)
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-1 scale-[0.98]",
                isVisible ? "pointer-events-auto" : "pointer-events-none",
              ].join(" ")}
            >
              <div className="overflow-hidden rounded-2xl">
                {/* eager: we already preloaded; avoids lazy jank */}
                <LazyImage
                  src={img.src}
                  alt={img.alt || ""}
                  loading="eager"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox modal */}
      {openIndex !== null && images[openIndex] && (
        <Lightbox
          image={images[openIndex]}
          index={openIndex}
          count={images.length}
          onPrev={() =>
            setOpenIndex((idx) => (idx - 1 + images.length) % images.length)
          }
          onNext={() => setOpenIndex((idx) => (idx + 1) % images.length)}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

function Lightbox({ image, index, count, onPrev, onNext, onClose }) {
  const nextBtnRef = useRef(null);
  const containerRef = useRef(null);
  const [show, setShow] = useState(false); // enter/exit animation flag

  // Focus & enter animation
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setShow(true);
      if (count > 1 && nextBtnRef.current) nextBtnRef.current.focus();
      else if (containerRef.current) containerRef.current.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [count]);

  // Keyboard: Esc / Arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        requestClose();
      } else if (e.key === "ArrowRight" && count > 1) {
        onNext();
      } else if (e.key === "ArrowLeft" && count > 1) {
        onPrev();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onNext, onPrev, count]);

  // Smooth exit then unmount
  const requestClose = () => {
    setShow(false);
    setTimeout(onClose, 320); // matches duration-300 + tiny buffer
  };

  // Backdrop click closes
  const onBackdropPointer = (e) => {
    if (e.currentTarget === e.target) requestClose();
  };

  // Theme-aware glass buttons:
  // - Light mode: white glass chip + BLACK arrow
  // - Dark mode: black glass chip + WHITE arrow
  const btnBase =
    "h-10 w-10 rounded-full flex items-center justify-center shadow " +
    "focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-black " +
    "transform transition-transform duration-200 hover:scale-110";
  const btnTheme =
    "bg-white/60 text-black dark:bg-black/50 dark:text-white " + // force correct text (arrow) color per theme
    "backdrop-blur-md ring-1 ring-black/15 dark:ring-white/20";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image?.alt || "Image dialog"}
      className={`
        fixed inset-0 z-[100]
        flex items-center justify-center
        p-4
        transition-all duration-300
        ${show ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-0"}
      `}
      onMouseDown={onBackdropPointer}
      onTouchStart={onBackdropPointer}
    >
      {/* Image container */}
      <div
        ref={containerRef}
        tabIndex={-1}
        className={`
          relative max-w-6xl w-full max-h-[88vh] flex items-center justify-center
          transition-all duration-300 will-change-[transform,opacity]
          ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Prev / Next (no X button) */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous image"
              className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 ${btnBase} ${btnTheme}`}
            >
              {/* Left chevron — explicitly themed to avoid parent overrides */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-black dark:text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            <button
              ref={nextBtnRef}
              type="button"
              onClick={onNext}
              aria-label="Next image"
              className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 ${btnBase} ${btnTheme}`}
            >
              {/* Right chevron — explicitly themed to avoid parent overrides */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-black dark:text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 6 7.59 7.41 12.17 12l-4.58 4.59L9 18l6-6z" />
              </svg>
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={image?.src}
          alt={image?.alt || ""}
          className="max-h-[88vh] w-auto max-w-full rounded-2xl shadow-2xl select-none"
          draggable="false"
        />

        {/* Counter (bottom-center) */}
        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-black/50 text-white dark:bg-white/60 dark:text-black backdrop-blur-sm">
            {index + 1} / {count}
          </div>
        )}
      </div>
    </div>
  );
}
