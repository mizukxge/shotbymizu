// src/pages/Projects.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PROJECTS } from "../data/projects.js";
import { Masonry } from "../components/Masonry.jsx";
import { Head } from "../components/Head.jsx";

export default function ProjectsPage() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const open = PROJECTS.find((p) => p.key === active);

  // --- Theme detection (match Home.jsx approach) ---
  const getIsDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const [isDark, setIsDark] = useState(getIsDark());

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setIsDark(html.classList.contains("dark"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // Inline border color so it’s crisp in both themes (same trick as Home)
  const outlineStyle = useMemo(
    () => ({
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: isDark ? "var(--color-white)" : "var(--color-black)",
    }),
    [isDark]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Head title="Projects" />

      {!open ? (
        <div className="grid md:grid-cols-2 gap-8">
          {PROJECTS.map((p) => (
            <button
              key={p.key}
              onClick={() => setActive(p.key)}
              className="text-left group"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-2xl shadow">
                <img
                  src={p.hero}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-lg">{p.title}</h3>
                <p className="opacity-70 text-sm">{p.location}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button className="underline mb-6" onClick={() => setActive(null)}>
            &larr; All projects
          </button>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Masonry
                items={open.images}
                watermark
                columnClass="columns-1 sm:columns-2 gap-6"
              />
            </div>

            <aside className="space-y-4">
              <h2 className="text-xl">{open.title}</h2>
              <div className="text-sm opacity-80 space-y-2">
                <p>
                  <span className="font-semibold">Concept:</span> {open.concept}
                </p>
                <p>
                  <span className="font-semibold">Brief:</span> {open.brief}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {open.location}
                </p>
              </div>

              {/* Outlined CTA — matches Home.jsx behavior */}
              {/* Outlined CTA — matches Home.jsx behavior */}
              <button
                type="button"
                onClick={() => navigate("/contact")}
                style={outlineStyle}
                className={[
                  "rounded-xl px-4 py-2 bg-transparent transition",
                  "duration-200 ease-out",
                  "transform hover:scale-[1.03] active:scale-[0.99]",
                  "cursor-pointer", // 👈 ensures hand cursor
                  isDark
                    ? "text-white hover:bg-white hover:text-black"
                    : "text-black hover:bg-black hover:text-white",
                  "focus:outline-none focus:ring-2",
                  isDark ? "focus:ring-white/80" : "focus:ring-black/80",
                ].join(" ")}
              >
                Enquire about similar work
              </button>

            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
