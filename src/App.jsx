import React, { useMemo, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { SITE } from "./config/site.js";
import Nav from "./components/Nav.jsx";
import { Footer } from "./components/Footer.jsx";
import { CookieConsent } from "./components/CookieConsent.jsx";
import { Head } from "./components/Head.jsx";

import HomePage from "./pages/Home.jsx";
import PortfolioPage from "./pages/Portfolio.jsx";
import ProjectsPage from "./pages/Projects.jsx";
import AboutPage from "./pages/About.jsx";
import ContactPage from "./pages/Contact.jsx";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  const schema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Person",
      name: SITE.owner,
      jobTitle: "Photographer",
      address: { "@type": "PostalAddress", addressLocality: "London", addressCountry: "GB" },
      email: SITE.email,
      sameAs: Object.values(SITE.social).filter(Boolean),
    }),
    []
  );

  return (
    <div className="min-h-screen bg-inherit text-inherit theme-smooth">
      <Head title="" schema={schema} />
      <CookieConsent />
      <Nav />

      {/* match navbar height (h-14) */}
      <main className="pt-14 bg-inherit text-inherit theme-smooth">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
