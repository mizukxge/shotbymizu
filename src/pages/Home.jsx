// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import { BEFORE_AFTER } from "../data/beforeAfter.js";
import BeforeAfter from "../components/BeforeAfter.jsx";
import { SITE } from "../config/site.js";
import { Head } from "../components/Head.jsx";
import InstagramEmbed from "../components/InstagramEmbed.jsx";

// Small helper to extract the handle consistently for the label/link
function extractHandle(value) {
  if (!value) return "shotbymizu";
  let v = String(value).trim();
  v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  v = v.replace(/^@/, "");
  v = v.split(/[/?#]/)[0];
  return v || "shotbymizu";
}

export default function HomePage() {
  const igHandle = extractHandle(SITE.social?.instagram);
  const igProfileUrl = `https://www.instagram.com/${igHandle}`;

  // --- Theme detection local to this page (no other files touched) ---
  const getIsDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const [isDark, setIsDark] = useState(getIsDark());

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setIsDark(html.classList.contains("dark"));
    // Initial sync
    update();
    // Watch for class changes on <html> (ThemeToggle flips .dark/.light)
    const mo = new MutationObserver(update);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // Inline border color wins against all conflicting CSS
  const outlineStyle = useMemo(
    () => ({
      borderWidth: "1px", // reduced from 2px → 1px
      borderStyle: "solid",
      borderColor: isDark ? "var(--color-white)" : "var(--color-black)",
    }),
    [isDark]
  );

  return (
    <main>
      <Head title="Home" />

      {/* HERO with fade-in already inside Hero.jsx */}
      <Hero />

      {/* INTRO SECTION */}
      <motion.section
        className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="md:col-span-2">
          <h2 className="text-xl md:text-2xl">
            I photograph people, places and products—and I do it well.
          </h2>
          <p className="mt-3 opacity-80 max-w-2xl">
            Whether you need compelling lifestyle imagery, stunning location shoots, 
            or product photography that sells, I bring a keen eye for detail and 
            years of experience to every project. My work focuses on creating striking 
            visuals that capture the essence of your brand while maintaining the highest 
            professional standards. Let's collaborate to bring your vision to life with 
            photography that truly delivers results.
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Filled primary */}
            <Link
              to="/portfolio"
              className="rounded-xl px-4 py-2 bg-black text-white dark:bg-white dark:text-black
                         hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors duration-200"
            >
              View Portfolio
            </Link>

            {/* Outlined secondary — border enforced inline, thinner (1px) */}
            <Link
              to="/projects"
              style={outlineStyle}
              className={`rounded-xl px-4 py-2 bg-transparent transition-colors duration-200
                ${isDark
                  ? "text-white hover:bg-white hover:text-black"
                  : "text-black hover:bg-black hover:text-white"}`}
            >
              See Projects
            </Link>

            {/* Outlined secondary — border enforced inline, thinner (1px) */}
            <Link
              to="/contact"
              style={outlineStyle}
              className={`rounded-xl px-4 py-2 bg-transparent transition-colors duration-200
                ${isDark
                  ? "text-white hover:bg-white hover:text-black"
                  : "text-black hover:bg-black hover:text-white"}`}
            >
              Enquire
            </Link>
          </div>
        </div>

        <aside className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-wide">For</p>
          <ul className="list-disc pl-5 opacity-80">
            <li>Content creators — proof, fair rates, fast turnaround</li>
            <li>Brands — trust, careful product placement, editorial polish</li>
            <li>Property owners — unobtrusive on-site shoots</li>
          </ul>
          <p className="opacity-70">
            Enquiries only → I reply by email.
          </p>
        </aside>
      </motion.section>

      {/* BEFORE/AFTER SECTION */}
      <motion.section
        className="mx-auto max-w-6xl px-4 py-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-lg md:text-xl mb-4">Before / After</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {BEFORE_AFTER.map((ba) => (
            <BeforeAfter key={ba.id} {...ba} />
          ))}
        </div>
      </motion.section>

      {/* INSTAGRAM SECTION */}
      <motion.section
        className="mx-auto max-w-6xl px-4 py-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-lg md:text-xl">Instagram</h3>
          <a
            className="underline opacity-80"
            href={igProfileUrl}
            target="_blank"
            rel="noreferrer"
          >
            @{igHandle}
          </a>
        </div>

        {/* Pass the handle explicitly so the embed and label stay in sync */}
        <InstagramEmbed handle={igHandle} />
      </motion.section>
    </main>
  );
}
