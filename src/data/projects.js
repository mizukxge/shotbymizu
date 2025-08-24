// src/data/projects.js
import { img } from "./images.js";

// zero-pad helper to build project paths
const pad = (n, size = 2) => String(n).padStart(size, "0");

/**
 * Projects:
 * - /images/projects/Game-Time/image-01.jpg … image-08.jpg
 * - /images/projects/Interiors/Image-01.jpg … Image-13.jpg   (NOTE: capital "I" in filename)
 *
 * We’ll set the project hero image to the first image in each folder.
 */
const projectSeries = {
  gameTime: {
    key: "game-time",
    title: "Game Time-Brand Shoot",
    folder: "/images/projects/Game-Time",
    filePrefix: "image", // lowercase for this folder
    count: 8,
    altPrefix: "Game Time",
    concept:
      "Fast, product-focused frames designed for brand social media.",
    brief:
      "Deliver a tight series with consistent light, clean compositions, and flexible negative space.",
    location: "London, UK",
    // Dimensions can be left default; adjust if you know your typical ratios
  },
  interiors: {
    key: "interiors",
    title: "Interior Shoot",
    folder: "/images/projects/Interiors",
    filePrefix: "image", // CAPITAL I — matches your files exactly
    count: 13,
    altPrefix: "Interiors",
    concept:
      "Efficient shoot of rental housing for property owners and design-forward clients.",
    brief:
      "Capture unobtrusive, natural-light scenes with true-to-material color and encompassing the scope of the properties offerings.",
    location: "London, UK",
  },
};

function buildProject(p) {
  const images = [];
  for (let i = 1; i <= p.count; i++) {
    const src = `${p.folder}/${p.filePrefix}-${pad(i, 2)}.jpg`;
    images.push(img(src, 1600, 1067, `${p.altPrefix} ${i}`));
  }
  // Use the first image as the hero (unless you add a dedicated hero.jpg)
  const hero = images[0]?.src || "";

  return {
    key: p.key,
    title: p.title,
    hero,
    concept: p.concept,
    brief: p.brief,
    location: p.location,
    images,
  };
}

export const PROJECTS = [
  buildProject(projectSeries.gameTime),
  buildProject(projectSeries.interiors),
];
