// src/components/Nav.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle.jsx";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const headerRef = useRef(null);
  const { pathname } = useLocation();

  // Close menu when route changes
  useEffect(() => setOpen(false), [pathname]);

  // Close on click outside or Escape
  useEffect(() => {
    if (!open) return;

    const onDocPointer = (e) => {
      const target = e.target;
      const panel = panelRef.current;
      const toggle = toggleRef.current;

      if (
        (panel && panel.contains(target)) ||
        (toggle && toggle.contains(target))
      ) {
        return;
      }
      setOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocPointer, true);
    document.addEventListener("touchstart", onDocPointer, {
      passive: true,
      capture: true,
    });
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocPointer, true);
      document.removeEventListener("touchstart", onDocPointer, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const maxH = open && panelRef.current ? panelRef.current.scrollHeight : 0;

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-white/10 theme-smooth"
    >
      {/* Top bar */}
      <div className="bg-white/70 text-zinc-900 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-black/70 dark:text-white dark:supports-[backdrop-filter]:bg-black/70 theme-smooth">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="font-mono text-sm tracking-widest uppercase">
            shotbymizu
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex gap-6 text-sm items-center">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/portfolio">Portfolio</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <ThemeToggle />
          </nav>

          {/* Hamburger / X button */}
          <button
            ref={toggleRef}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center h-9 w-9 focus:outline-none"
          >
            <span
              className={`block h-0.5 w-5 bg-current transition-transform duration-300 ${
                open ? "rotate-45 translate-y-[3px]" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-current transition-opacity duration-300 my-[2px] ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-current transition-transform duration-300 ${
                open ? "-rotate-45 -translate-y-[3px]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className="md:hidden overflow-hidden bg-white/80 text-zinc-900 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-black/70 dark:text-white dark:supports-[backdrop-filter]:bg-black/70 border-b border-zinc-200 dark:border-white/10 theme-smooth"
        style={{
          maxHeight: `${maxH}px`,
          transition: "max-height 260ms ease, opacity 220ms ease",
          opacity: open ? 1 : 0,
        }}
      >
        <nav className="px-4 py-3 grid gap-3 text-sm">
          <MobileLink to="/" onClick={() => setOpen(false)}>Home</MobileLink>
          <MobileLink to="/portfolio" onClick={() => setOpen(false)}>Portfolio</MobileLink>
          <MobileLink to="/projects" onClick={() => setOpen(false)}>Projects</MobileLink>
          <MobileLink to="/about" onClick={() => setOpen(false)}>About</MobileLink>
          <MobileLink to="/contact" onClick={() => setOpen(false)}>Contact</MobileLink>

          {/* Theme toggle aligned with menu items */}
          <div className="block rounded-lg px-3 py-2 transition text-inherit uppercase tracking-wide">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`uppercase tracking-wide transition text-inherit hover:opacity-80 ${
        active ? "underline underline-offset-4" : ""
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block rounded-lg px-3 py-2 transition text-inherit uppercase tracking-wide ${
        active
          ? "underline underline-offset-4"
          : "hover:underline hover:underline-offset-4"
      }`}
    >
      {children}
    </Link>
  );
}
