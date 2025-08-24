import React from "react";
import { SITE } from "../config/site.js";

export default function InstagramEmbed() {
  const handle = SITE.owner?.toLowerCase() || "shotbymizu";
  const src = `https://www.instagram.com/${handle}/embed`;

  return (
    <div
      className="
        rounded-2xl 
        border border-zinc-300 dark:border-zinc-700 
        overflow-hidden 
        theme-smooth 
        bg-zinc-100 dark:bg-zinc-900
      "
    >
      {/* Give the iframe itself a background so it matches theme until loaded */}
      <iframe
        title={`Instagram feed @${handle}`}
        src={src}
        className="w-full h-[560px] md:h-[640px] block bg-zinc-100 dark:bg-zinc-900"
        style={{
          backgroundColor: "var(--tw-bg-opacity, transparent)",
        }}
        loading="lazy"
        frameBorder="0"
        scrolling="no"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
