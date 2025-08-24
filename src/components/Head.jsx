import { useEffect } from "react";
import { SITE } from "../config/site.js";
export function Head({ title, description, keywords = [], schema }) {
  useEffect(() => {
    document.title = title ? `${title}  ${SITE.owner}` : `${SITE.owner}  Photography`;
    const set = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    set("description", description || `${SITE.owner}: London-based portrait, travel, landscape, fashion & architecture photography.`);
    set("keywords", (keywords.length ? keywords : SITE.keywords).join(", "));
    if (schema) {
      let script = document.querySelector("script[type='application/ld+json']#schema");
      if (!script) {
        script = document.createElement("script"); script.type = "application/ld+json"; script.id = "schema";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }
  }, [title, description, keywords, schema]);
  return null;
}
