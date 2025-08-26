// src/components/LazyImage.jsx
import React, { useEffect, useRef, useState } from "react";
import { SITE } from "../config/site.js";

// Decide whether we're on a Cloudflare-hosted origin
function isProdCF() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return !(
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]"
  );
}

// Build a Cloudflare Image Resizing URL (same-zone)
function cfUrl(src, opts = {}) {
  // Ensure we have a proper URL object
  const u = new URL(src, window.location.origin);

  // Params: tweak to your taste
  const {
    width,           // number | undefined
    quality = 75,    // 1..100
    fit = "cover",   // 'cover'|'contain'|'scale-down'|'pad'
    format = "auto", // 'auto' to negotiate AVIF/WebP/JPEG
  } = opts;

  const parts = [];
  if (width) parts.push(`width=${width}`);
  parts.push(`fit=${fit}`);
  parts.push(`quality=${quality}`);
  parts.push(`format=${format}`);

  // Cloudflare accepts relative paths for same zone
  // e.g. /cdn-cgi/image/width=1200,quality=75,format=auto/images/foo.jpg
  return `/cdn-cgi/image/${parts.join(",")}${u.pathname}${u.search}`;
}

/**
 * LazyImage
 * - IntersectionObserver to defer load
 * - Uses CF Image Resizing on production only
 * - Falls back to the raw src on error
 */
export default function LazyImage({
  src,
  alt = "",
  caption,
  className = "",
  watermark = true,
  width,   // optional intrinsic width
  height,  // optional intrinsic height
}) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  // Kick in when close to viewport
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { rootMargin: "300px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // Compute final URL:
  // - in dev: raw src
  // - in prod: CF url (unless we already failed once)
  const finalSrc =
    failed || !isProdCF()
      ? src
      : cfUrl(src, { width: 2000, quality: 78, fit: "cover", format: "auto" });

  return (
    <figure ref={ref} className={`relative group overflow-hidden ${className}`}>
      {inView && (
        <img
          src={finalSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
          onLoad={() => setLoaded(true)}
          onError={() => {
            // If CF URL fails once, fall back to original for this component
            if (!failed && isProdCF()) setFailed(true);
          }}
          className={[
            "w-full h-auto transition duration-700 will-change-transform",
            loaded ? "scale-100 blur-0 opacity-100" : "scale-[1.02] blur-sm opacity-80",
          ].join(" ")}
          // prevent referrer weirdness when mixing http/https
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {watermark && (
        <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] tracking-widest uppercase opacity-70 mix-blend-overlay select-none">
          © {SITE.owner.toUpperCase()}
        </span>
      )}

      {caption && (
        <figcaption className="mt-2 text-xs opacity-70">{caption}</figcaption>
      )}
    </figure>
  );
}
