import React from "react";
import { SITE } from "../config/site.js";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800 theme-smooth">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="font-mono tracking-widest uppercase">{SITE.owner}</p>
          <p className="opacity-70 mt-2">{SITE.tagline}</p>
          <p className="opacity-70 mt-2">{SITE.location}</p>
        </div>

        <div>
          <p className="font-semibold">Contact</p>
          <a className="underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          <div className="mt-2 flex gap-3">
            <a
              className="underline"
              href={SITE.social.instagram}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              className="underline"
              href={SITE.social.tiktok}
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>
          </div>
        </div>

        <div>
          <p className="font-semibold">Legal</p>
          <Link to="/about" className="underline block">
            Privacy & Cookies
          </Link>
          <Link to="/about" className="underline block">
            Copyright & Licensing
          </Link>
        </div>

        <div>
          <p className="font-semibold">Mini Bio</p>
          <p className="opacity-80">
            London-based photographer focusing on portraits, travel and
            architecture. Available across the UK/EU. Brazil residency window
            upcoming.
          </p>
        </div>
      </div>

      <div className="text-center text-xs opacity-60 pb-8 theme-smooth">
        {new Date().getFullYear()} {SITE.owner}. All rights reserved.
      </div>
    </footer>
  );
}
