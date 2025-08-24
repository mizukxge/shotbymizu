import React from "react";
import { SITE } from "../config/site.js";
import { Head } from "../components/Head.jsx";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <Head title="About" />
      <section>
        <h2 className="text-xl md:text-2xl">Bio</h2>
        <p className="mt-3 opacity-80 text-justify">
          I'm Michael, a London-based photographer specializing in portraits, travel, architecture, and products. I work quietly with individuals and brands to create images that feel intimate yet highly usable. My approach blends editorial restraint with practical considerations for campaigns—clean compositions, consistent lighting, and files that grade well.
        </p>
      </section>
      <section>
        <p className="mt-3 opacity-80 text-justify">
          Typical clients include content creators needing strong portraits, brands looking for product-forward images in real locations, and property owners requiring unobtrusive documentation. I enjoy discussing a brand's vision before we shoot, including whether experimental techniques will serve the brief. Style: experimental, intimate. Often found chasing first light.
        </p>
      </section>
      <section>
        <p className="mt-3 opacity-80 text-justify">
          I'm based in London and regularly work around the UK and Europe, with a three-month Brazil stint planned to capture products in distinctive landscapes. Deliveries are efficient, and retouching is subtle but considered. Enquiries welcome.
        </p>
      </section>
      <section id="privacy">
        <h2 className="text-xl md:text-2xl">Privacy & Cookies</h2>
        <p className="mt-3 opacity-80 text-sm text-justify">
          This site stores minimal data necessary for preferences and basic analytics. No personal data is sold. For enquiries, your message is sent by email and handled solely for project communication. You may request your data be deleted at any time via {SITE.email}.
        </p>
      </section>
      <section id="copyright">
        <h2 className="text-xl md:text-2xl">Copyright & Licensing</h2>
        <p className="mt-3 opacity-80 text-sm text-justify">
           {new Date().getFullYear()} {SITE.owner}. All images and text on this website are protected by copyright. Commercial usage rights and licensing terms are confirmed in writing per project on delivery. RAW files are not distributed except where agreed in contract.
        </p>
      </section>
    </main>
  );
}