// src/components/Masonry.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import LazyImage from "./LazyImage.jsx";
import { SITE } from "../config/site.js";

/**
 * Masonry (named export)
 * - CSS Columns layout preserved
 * - Preloads all images before revealing
 * - Measures tiles to compute row-wise reveal order
 * - Lightbox: watermark overlay + "Download (watermarked)" button
 */
export function Masonry({
  items = [],
  columnClass = "columns-1 sm:columns-2 lg:columns-3 gap-6",
  seed,
  watermark = false, // still respected on grid thumbnails
}) {
  const images = useMemo(
    () =>
      (items || []).map((it, i) => {
        const src = it?.src || it?.url || it?.image || "";
        const alt = it?.alt || it?.title || `Image ${i + 1}`;
        return { src, alt, ...it };
      }),
    [items, seed]
  );

  // Preload all images first
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(() => images.map(() => false));
  const itemRefs = useRef([]);
  itemRefs.current = [];

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setVisible(images.map(() => false));

    const preloadOne = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true); // don't block sequence
        // IMPORTANT for canvas export safety if your origin ever differs:
        img.crossOrigin = "anonymous";
        img.src = src;
      });

    Promise.all(images.map((i) => preloadOne(i.src))).then(() => {
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
      const positions = images.map((_, i) => {
        const el = itemRefs.current[i];
        if (!el) return { i, top: Number.POSITIVE_INFINITY, left: 0 };
        const rect = el.getBoundingClientRect();
        return { i, top: Math.round(rect.top), left: Math.round(rect.left) };
      });

      positions.sort((a, b) => (a.top - b.top) || (a.left - b.left));

      positions.forEach((p, rank) => {
        const delay = 60 + rank * 110;
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

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measureAndReveal);
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      timers.forEach(clearTimeout);
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
                "mb-6 break-inside-avoid block w-full group focus:outline-none cursor-zoom-in",
                "transition-all duration-500 ease-out",
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-1 scale-[0.98]",
                isVisible ? "pointer-events-auto" : "pointer-events-none",
              ].join(" ")}
            >
              <div className="overflow-hidden rounded-2xl">
                <LazyImage
                  src={img.src}
                  alt={img.alt || ""}
                  loading="eager"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                  watermark={watermark}
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

/* -----------------------
   Lightbox with watermark
   ----------------------- */

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
    setTimeout(onClose, 320);
  };

  // Prevent right-click save in the modal (soft deterrent)
  const preventContext = (e) => e.preventDefault();

  // Build a *watermarked* image and download it
  const downloadWatermarked = async () => {
    try {
      const src = image?.src;
      if (!src) return;

      // Load image fully
      const img = await loadImage(src);

      // Create canvas
      const canvas = document.createElement("canvas");
      const W = img.naturalWidth || img.width;
      const H = img.naturalHeight || img.height;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      // Draw original
      ctx.drawImage(img, 0, 0, W, H);

      // Watermark text
      const text = `© ${String(SITE.owner || "shotbymizu").toUpperCase()}`;

      // Size & placement (relative to image size)
      const pad = Math.max(10, Math.round(W * 0.012));
      const fontPx = Math.max(14, Math.round(W * 0.018));
      ctx.font = `600 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
      ctx.textBaseline = "bottom";

      const metrics = ctx.measureText(text);
      const tw = metrics.width;
      const th = fontPx; // rough height

      const x = W - pad - tw;
      const y = H - pad;

      // Shadow for legibility
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(x - pad * 0.4, y - th - pad * 0.4, tw + pad * 0.8, th + pad * 0.8);

      // Text (white)
      ctx.fillStyle = "#fff";
      ctx.fillText(text, x, y);

      // Export & download
      const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = makeDownloadName(src, SITE?.owner);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  // Theme-aware glass buttons:
  const btnBase =
    "h-10 w-10 rounded-full flex items-center justify-center shadow " +
    "focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-black " +
    "transform transition-transform duration-200 hover:scale-110";
  const btnTheme =
    "bg-white/60 text-black dark:bg-black/50 dark:text-white " +
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
      onMouseDown={(e) => e.currentTarget === e.target && requestClose()}
      onTouchStart={(e) => e.currentTarget === e.target && requestClose()}
      onContextMenu={preventContext}
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
        {/* Prev / Next */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous image"
              className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 ${btnBase} ${btnTheme} cursor-pointer`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            <button
              ref={nextBtnRef}
              type="button"
              onClick={onNext}
              aria-label="Next image"
              className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 ${btnBase} ${btnTheme} cursor-pointer`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 6 7.59 7.41 12.17 12l-4.58 4.59L9 18l6-6z" />
              </svg>
            </button>
          </>
        )}

        {/* Image + overlay watermark (visible while viewing) */}
        <div className="relative">
          <img
            src={image?.src}
            alt={image?.alt || ""}
            className="max-h-[88vh] w-auto max-w-full rounded-2xl shadow-2xl select-none"
            draggable="false"
            onContextMenu={preventContext}
            crossOrigin="anonymous"
          />

          {/* On-screen watermark */}
          <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] md:text-xs tracking-widest uppercase opacity-80 select-none text-white bg-black/40 rounded px-2 py-1">
            © {String(SITE.owner || "shotbymizu").toUpperCase()}
          </span>
        </div>

        {/* Counter (bottom-center) */}
        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-black/50 text-white dark:bg-white/60 dark:text-black backdrop-blur-sm">
            {index + 1} / {count}
          </div>
        )}

        {/* Download (watermarked) */}
        <button
          type="button"
          onClick={downloadWatermarked}
          className={`absolute bottom-3 right-3 h-9 px-3 rounded-full text-xs font-medium
                      ${btnTheme} cursor-pointer`}
          title="Download (watermarked)"
        >
          Download
        </button>
      </div>
    </div>
  );
}

/* -------------
   Small helpers
   ------------- */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous"; // safer for canvas export if ever served with CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function makeDownloadName(src, owner) {
  try {
    const u = new URL(src, window.location.origin);
    const base = u.pathname.split("/").pop() || "image.jpg";
    const dot = base.lastIndexOf(".");
    const name = dot > 0 ? base.slice(0, dot) : base;
    const brand = (owner || "shotbymizu").toString().replace(/\s+/g, "");
    return `${name}-${brand}-wm.jpg`;
  } catch {
    return `download-${(owner || "shotbymizu")}-wm.jpg`;
  }
}
