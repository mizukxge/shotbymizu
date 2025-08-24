// src/data/images.js

// Helper to declare images with dimensions + captions
export const img = (
  src,
  w = 1600,
  h = 1067,
  alt = "Untitled",
  caption = ""
) => ({ src, width: w, height: h, alt, caption });

// zero-pad helper: pad(7, 2) -> "07"
const pad = (n, size = 2) => String(n).padStart(size, "0");

// Generate a list of /public images following a pattern
// Example: gen("/images/Portrait/image", 15) -> [/images/Portrait/image-01.jpg ...]
const gen = (basePath, count, opts = {}) => {
  const {
    start = 1,
    padSize = 2,
    ext = ".jpg",
    altPrefix = "Image",
    w = 1600,
    h = 1067,
  } = opts;

  const arr = [];
  for (let i = start; i < start + count; i++) {
    const p = `${basePath}-${pad(i, padSize)}${ext}`;
    arr.push(img(p, w, h, `${altPrefix} ${i}`));
  }
  return arr;
};

/**
 * IMPORTANT — filenames must match EXACTLY (case-sensitive on the server):
 * - Aerial-Landscape/image-01.jpg … image-12.jpg
 * - Fashion-Abstract/image-01.jpg … image-12.jpg
 * - Portrait/image-01.jpg … image-15.jpg
 */
export const IMAGES = {
  aerialLandscape: gen("/images/Aerial-Landscape/image", 12, {
    altPrefix: "Aerial/Landscape",
  }),
  fashionAbstract: gen("/images/Fashion-Abstract/image", 12, {
    altPrefix: "Fashion/Abstract",
  }),
  portrait: gen("/images/Portrait/image", 15, {
    altPrefix: "Portrait",
  }),
};
