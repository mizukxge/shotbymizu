import React, { useState } from "react";

export function CookieConsent() {
  const [show, setShow] = useState(() => !localStorage.getItem("cookie-consent"));
  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92vw]
                 rounded-2xl border border-zinc-300 dark:border-zinc-700
                 bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur p-4 shadow-xl theme-smooth"
    >
      <p className="text-sm">
        This site uses minimal cookies for preferences and basic analytics. No tracking pixels until you agree.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            localStorage.setItem("cookie-consent", "accepted");
            setShow(false);
          }}
          className="rounded-2xl bg-black text-white dark:bg-white dark:text-black px-3 py-2 text-sm theme-smooth"
        >
          Accept
        </button>
        <button
          onClick={() => {
            localStorage.setItem("cookie-consent", "declined");
            setShow(false);
          }}
          className="rounded-2xl border px-3 py-2 text-sm theme-smooth"
        >
          Decline
        </button>
        <a href="#privacy" className="ml-auto text-sm underline opacity-80">
          Privacy
        </a>
      </div>
    </div>
  );
}
