import React, { useEffect, useRef, useState } from "react";

export default function BeforeAfter({
  before,
  after,
  title,
  caption,
  fit = "cover",
  start = 0.5,
}) {
  const wrapRef = useRef(null);
  const [x, setX] = useState(start);
  const [ratioPct, setRatioPct] = useState(56.25);

  useEffect(() => {
    const img = new Image();
    img.src = after;
    img.onload = () => {
      const r = (img.naturalHeight / img.naturalWidth) * 100;
      if (isFinite(r) && r > 0) setRatioPct(r);
    };
  }, [after]);

  const updatePosition = (clientX) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    setX(Math.max(0, Math.min(1, nx)));
  };

  const onPointerMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updatePosition(clientX);
  };

  const startDrag = (e) => {
    onPointerMove(e);

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);
  };

  const stopDrag = () => {
    window.removeEventListener("mousemove", onPointerMove);
    window.removeEventListener("touchmove", onPointerMove);
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("touchend", stopDrag);
  };

  useEffect(() => {
    return () => stopDrag();
  }, []);

  const fitClass = fit === "contain" ? "object-contain bg-black" : "object-cover";
  const rightInset = `${(1 - x) * 100}%`;
  const clip = `inset(0 ${rightInset} 0 0)`;

  return (
    <div className="w-full">
      {title && (
        <p className="mb-3 text-sm uppercase tracking-wide opacity-70">{title}</p>
      )}

      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-2xl shadow-lg select-none touch-none"
        style={{ paddingTop: `${ratioPct}%` }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        {/* AFTER layer */}
        <img
          src={after}
          alt="After"
          className={`absolute inset-0 w-full h-full ${fitClass}`}
          draggable="false"
        />

        {/* BEFORE layer */}
        <img
          src={before}
          alt="Before"
          className={`absolute inset-0 w-full h-full ${fitClass}`}
          style={{ clipPath: clip, WebkitClipPath: clip }}
          draggable="false"
        />

        {/* Divider + handle */}
        <div
          className="absolute top-0 bottom-0"
          style={{ left: `${x * 100}%` }}
          aria-hidden="true"
        >
          <div className="-ml-0.5 h-full w-1 bg-white dark:bg-zinc-900/80 dark:bg-white dark:bg-zinc-900/30 pointer-events-none" />
          <button
            type="button"
            aria-label="Drag to compare"
            className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2
                       w-9 h-9 rounded-full bg-black/70 text-white
                       inline-flex items-center justify-center gap-x-0.5
                       focus:outline-none focus:ring-2 focus:ring-white/70
                       transition duration-200 hover:bg-black hover:scale-110 hover:shadow-lg"
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          >
            {/* Left chevron */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 6 L9 12 L15 18" />
            </svg>
            {/* Right chevron */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 6 L15 12 L9 18" />
            </svg>
          </button>
        </div>
      </div>

      {caption && <p className="mt-2 text-xs opacity-70">{caption}</p>}
    </div>
  );
}
