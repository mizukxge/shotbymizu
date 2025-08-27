// src/components/Masonry.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import LazyImage from "./LazyImage.jsx";

/**
 * Masonry
 * - Uses CSS columns for natural masonry
 * - No global preload gate → blur-up is visible per tile
 * - Reserves space via aspect-ratio so layout is stable before images load
 * - Computes row-wise order (top/left measurement) and applies staggered reveal
 * - Optional lightbox kept, but you can remove it if not needed
 */
export function Masonry({
  items = [],
  columnClass = "columns-1 sm:columns-2 lg:columns-3 gap-6",
  watermark = false, // reserved
}) {
  // Normalize items (ensure width/height present when available)
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

  // Measure each tile to determine row-wise order → stagger timing
  const itemRefs = useRef([]);
  itemRefs.current = [];

  const [ready, setReady] = useState(false);
  const [orderIndex, setOrderIndex] = useState([]); // index -> rank in visual order

  useEffect(() => {
    // Wait a frame so the browser can lay out the column masonry
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

  // Lightbox (unchanged behavior)
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
              style={{
                transitionDelay: ready ? `${rank * 90}ms` : "0ms",
              }}
            >
              <div className="overflow-hidden rounded-2xl">
                <LazyImage
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  className="w-full"
                />
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
        />
      )}
    </>
  );
}

function Lightbox({ image, index, count, onPrev, onNext, onClose }) {
  const nextBtnRef = useRef(null);
  const containerRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setShow(true);
      if (count > 1 && nextBtnRef.current) nextBtnRef.current.focus();
      else if (containerRef.current) containerRef.current.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [count]);

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

  const btnBase =
    "h-10 w-10 rounded-full flex items-center justify-center shadow " +
    "focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-black " +
    "transform transition-transform duration-200 hover:scale-110 cursor-pointer";
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
      onMouseDown={onBackdropPointer}
      onTouchStart={onBackdropPointer}
    >
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
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous image"
              className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 ${btnBase} ${btnTheme}`}
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

            <button
              ref={nextBtnRef}
              type="button"
              onClick={onNext}
              aria-label="Next image"
              className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 ${btnBase} ${btnTheme}`}
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
          </>
        )}

        <img
          src={image?.src}
          alt={image?.alt || ""}
          className="max-h-[88vh] w-auto max-w-full rounded-2xl shadow-2xl select-none"
          draggable="false"
        />

        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-black/50 text-white dark:bg-white/60 dark:text-black backdrop-blur-sm">
            {index + 1} / {count}
          </div>
        )}
      </div>
    </div>
  );
}
