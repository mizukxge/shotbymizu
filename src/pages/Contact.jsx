// src/pages/Contact.jsx
import React, { useState } from "react";
import { SITE } from "../config/site.js";
import { Head } from "../components/Head.jsx";
import { cx } from "../utils/cx.js";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    audience: "Content Creator / Individual",
    message: "",
    scope: "single",
    date: "",
    start: "",
    end: "",
  });

  // Validation: name, valid email, message, and relevant date(s)
  const emailValid = /.+@.+\..+/.test(form.email);
  const dateValid =
    form.scope === "single" ? !!form.date : !!(form.start && form.end);
  const canSubmit = !!(form.name && emailValid && form.message && dateValid);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const subject = encodeURIComponent("Photography enquiry");
    const when =
      form.scope === "single"
        ? `Date: ${form.date}`
        : `Span: ${form.start}  ${form.end}`;
    const body = encodeURIComponent(`Name: ${form.name}
Email: ${form.email}
Segment: ${form.audience}
${when}

Brief:
${form.message}

(Submitted via site)`);
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Head title="Contact" />
      <h2 className="text-xl md:text-2xl">Enquire</h2>
      <p className="mt-2 opacity-80 text-sm">
        You’ll receive a acknowledgement and a response within 3 working days.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block text-sm">
            Name <span className="text-red-500">*</span>
            <input
              className="mt-1 form-control"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="block text-sm">
            Email <span className="text-red-500">*</span>
            <input
              className="mt-1 form-control"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
        </div>

        {/* Audience */}
        <label className="block text-sm">
          Which best describes you? <span className="text-red-500">*</span>
          <div className="relative mt-1">
            <select
              className="form-control pr-9"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            >
              <option>Content Creator / Individual</option>
              <option>Brand</option>
              <option>Property / Business Owner</option>
            </select>

            {/* Chevron */}
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70 text-zinc-900 dark:text-zinc-200"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
             
            </svg>
          </div>
        </label>

        {/* Date scope */}
        <fieldset className="border rounded-xl p-3 border-zinc-300 dark:border-zinc-700">
          <legend className="px-1 text-sm">Is this a single day or a period?</legend>
          <div className="flex gap-4 items-center text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="scope"
                checked={form.scope === "single"}
                onChange={() =>
                  setForm({ ...form, scope: "single", start: "", end: "" })
                }
              />
              Single day
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="scope"
                checked={form.scope === "period"}
                onChange={() =>
                  setForm({ ...form, scope: "period", date: "" })
                }
              />
              Period
            </label>
          </div>

          {form.scope === "single" ? (
            <label className="block text-sm mt-3">
              Pick a day <span className="text-red-500">*</span>
              <input
                type="date"
                className="mt-1 form-control"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <label className="block text-sm">
                Start <span className="text-red-500">*</span>
                <input
                  type="date"
                  className="mt-1 form-control"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                End <span className="text-red-500">*</span>
                <input
                  type="date"
                  className="mt-1 form-control"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                />
              </label>
            </div>
          )}
        </fieldset>

        <label className="block text-sm">
          Message / Brief <span className="text-red-500">*</span>
          <textarea
            className="mt-1 form-control min-h-[120px]"
            placeholder="What are we shooting? Where? Any references?"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </label>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            aria-disabled={!canSubmit}
            disabled={!canSubmit}
            title={canSubmit ? "Send enquiry" : "Complete the required fields first"}
            className={cx(
              "rounded-xl px-4 py-2 inline-flex items-center justify-center transition-colors duration-200",
              canSubmit ? "btn-primary" : "btn-disabled"
            )}
          >
            Send Enquiry
          </button>

          <p className="text-xs opacity-70">
            This opens your email app with the details pre-filled.
          </p>
        </div>
      </form>
    </main>
  );
}
