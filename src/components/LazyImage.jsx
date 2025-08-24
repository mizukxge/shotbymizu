// src/components/LazyImage.jsx
import React, { useState } from "react";

/**
 * Default-exported LazyImage
 * - Smooth opacity fade when the image itself finishes loading
 * - Accepts any extra props (e.g. loading="eager")
 */
export default function LazyImage({
  src,
  alt = "",
  className = "",
  onLoad: onLoadProp,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);

  const onLoad = (e) => {
    setLoaded(true);
    if (onLoadProp) onLoadProp(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      onLoad={onLoad}
      className={[
        className,
        "transition-opacity duration-700 will-change-[opacity]",
        loaded ? "opacity-100" : "opacity-0",
      ].join(" ")}
      {...rest}
    />
  );
}
