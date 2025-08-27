// src/components/Masonry.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import LazyImage from "./LazyImage.jsx";
import { SITE } from "../config/site.js";

/**
 * Masonry
 * - CSS columns for natural masonry
 * - Blur-up handled by LazyImage per tile
 * - Watermark on tiles and in lightbox
 * - Lightbox arrows are positioned INSIDE the image wrapper (no measuring)
 */
function Masonry({
  items = [],
  columnClass = "columns-1 sm:columns-2 lg:columns-3 gap-6",
  watermark = true,
}) {
  // Normalize incoming items
  const images = useMemo(
    () =>
      (items || []).map((it, i) => {
        const src = it?.src || it?.url || it?.image || "";
        const alt = it?.alt || it?.title || `Image ${i + 1}`;
        const width = it?.width;
        const height = it?.height;
        return { src, alt, width, height, ...it };
      }),
    [items]
  );

  // Row-wise stagger (deterministic based on visual order)
  const itemRefs = useRef([]);
  itemRefs.current = [];
  const [ready, setReady] = useState(false);
  const [orderIndex, setOrderIndex] = useState([]);

  useEffect(() => {
    let r1, r2;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        const positions = itemRefs.current.map((el, i) => {
          if (!el) return { i, top: 0, left: 0 };
          const rect = el.getBoundingClientRect();
          return { i, top: Math.round(rect.top), left: Math.round(rect.left) };
        });
        positions.sort((a, b) =>
          a.top === b.top ? a.left - b.left : a.top - b.top
        );
        const map = new Array(positions.length);
        positions.forEach((p, rank) => (map[p.i] = rank));
        setOrderIndex(map);
        setReady(true);
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [images.length]);

  // Lightbox state
  const [openIndex, setOpenIndex] = useState(null);
  useEffect(() => {
    if (openIndex !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [openIndex]);

  return (
    <>
      <div className={columnClass}>
        {images.map((img, i) => {
          const rank = orderIndex[i] ?? i;
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
                ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
              ].join(" ")}
              style={{ transitionDelay: ready ? `${rank * 90}ms` : "0ms" }}
            >
              <div className="relative overflow-hidden rounded-2xl">
                <LazyImage
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  className="w-full h-auto"
                />
                {watermark && (
                  <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] tracking-widest uppercase opacity-70 mix-blend-overlay select-none">
                    © {SITE.owner}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

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
          watermark={watermark}
        />
      )}
    </>
  );
}

function Lightbox({ image, index, count, onPrev, onNext, onClose, watermark }) {
  const nextBtnRef = useRef(null);
  const [show, setShow] = useState(false);

  // Enter animation + focus
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setShow(true);
      if (count > 1 && nextBtnRef.current) nextBtnRef.current.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [count]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") requestClose();
      else if (e.key === "ArrowRight" && count > 1) onNext();
      else if (e.key === "ArrowLeft" && count > 1) onPrev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onNext, onPrev, count]);

  const requestClose = () => {
    setShow(false);
    setTimeout(onClose, 320);
  };

  const onBackdropPointer = (e) => {
    if (e.currentTarget === e.target) requestClose();
  };

  // Theme-aware glass buttons
  const btnBase =
    "h-10 w-10 rounded-full flex items-center justify-center shadow " +
    "focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-black " +
    "transform transition-transform duration-200 hover:scale-110 cursor-pointer select-none z-10";
  const btnTheme =
    "bg-white/60 text-black dark:bg-black/50 dark:text-white " +
    "backdrop-blur-md ring-1 ring-black/15 dark:ring-white/20";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image?.alt || "Image dialog"}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        show ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-0"
      }`}
      onMouseDown={onBackdropPointer}
      onTouchStart={onBackdropPointer}
    >
      {/* Center the image; this wrapper is NOT positioning the arrows anymore */}
      <div
        className={`relative max-w-6xl w-full max-h-[88vh] flex items-center justify-center transition-all duration-300 will-change-[transform,opacity] ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* The image wrapper is relative and matches the rendered image's box.
            Arrows are absolutely positioned INSIDE this wrapper so they always
            hug the real image edges, no measurements needed. */}
        <div className="relative">
          {/* Prev */}
          {count > 1 && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous image"
              className={`${btnBase} ${btnTheme} absolute left-2 md:left-3 top-1/2 -translate-y-1/2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-black dark:text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
          )}

          {/* Image */}
          <img
            src={image?.src}
            alt={image?.alt || ""}
            className="max-h-[88vh] w-auto max-w-full rounded-2xl shadow-2xl select-none"
            draggable="false"
          />

          {/* Next */}
          {count > 1 && (
            <button
              ref={nextBtnRef}
              type="button"
              onClick={onNext}
              aria-label="Next image"
              className={`${btnBase} ${btnTheme} absolute right-2 md:right-3 top-1/2 -translate-y-1/2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-black dark:text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 6 7.59 7.41 12.17 12l-4.58 4.59L9 18l6-6z" />
              </svg>
            </button>
          )}

          {/* Watermark inside the image box */}
          {watermark && (
            <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] tracking-widest uppercase opacity-80 mix-blend-overlay select-none">
              © {SITE.owner}
            </span>
          )}
        </div>

        {/* Counter */}
        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-black/50 text-white dark:bg-white/60 dark:text-black backdrop-blur-sm">
            {index + 1} / {count}
          </div>
        )}
      </div>
    </div>
  );
}

export default Masonry;
export { Masonry };
