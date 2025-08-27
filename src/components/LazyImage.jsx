// src/components/LazyImage.jsx
import React, { useMemo, useState } from "react";
import { GENERATED_IMAGES } from "../data/generatedImages.js";

/**
 * LazyImage
 * - Uses responsive <picture> with webp variants from GENERATED_IMAGES
 * - Shows a blurred tiny placeholder until the selected source finishes
 * - Reserves space using aspect-ratio to avoid layout shift
 *
 * Props:
 *  - src: string (key in GENERATED_IMAGES, e.g. "Portrait/image-01.webp")
 *  - alt?: string
 *  - width?: number  (optional metadata for aspect ratio – recommended)
 *  - height?: number (optional metadata for aspect ratio – recommended)
 *  - className?: string (applied to wrapper)
 */
export default function LazyImage({
  src,
  alt = "",
  width,
  height,
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);

  const variants = useMemo(() => GENERATED_IMAGES[src] || [], [src]);
  const sorted = useMemo(
    () => [...variants].sort((a, b) => a.width - b.width),
    [variants]
  );

  // Blur placeholder = smallest variant (if present)
  const tiny = sorted[0]?.src;
  // Fallback = largest variant (ensures quality if browser ignores <source>)
  const fallback = sorted[sorted.length - 1]?.src;

  // Build srcset string: "url 320w, url 640w, ..."
  const srcSet = useMemo(
    () => sorted.map((v) => `${v.src} ${v.width}w`).join(", "),
    [sorted]
  );

  // Sensible default sizes (you can tailor to your columns)
  const sizes =
    "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

  // Reserve space via CSS aspect-ratio (using provided width/height if available)
  const ratio =
    width && height ? `${width} / ${height}` : undefined;

  if (!sorted.length) {
    // Fall back gracefully if the manifest key wasn't found
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={className}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {/* Blur-up placeholder */}
      {tiny && (
        <img
          src={tiny}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover scale-105 blur-lg transition-opacity duration-500 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Responsive image */}
      <picture>
        <source type="image/webp" srcSet={srcSet} sizes={sizes} />
        <img
          src={fallback}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </picture>
    </div>
  );
}
