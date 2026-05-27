'use client'

import { useState } from "react";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

const TOPICS = ["General", "Membership", "Events", "Welfare"] as const;
const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "Others"];

// Shared field/label styles, matching FormField so the inline <select> and
// <textarea> sit on the same design-system tokens as the text inputs.
const fieldClass =
  "rounded-md border-2 border-blue-100 bg-white px-4 py-3 text-body text-black outline-none transition-colors placeholder:text-gray-300 focus:border-blue-600 focus:shadow-sm";
const labelClass = "text-body-sm font-bold text-gray-700";

export function ContactSection() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("General");
  const [keepOnFile, setKeepOnFile] = useState(true);

  return (
    <section className="container pt-32 font-primary">
      <p className="eyebrow text-red-600">Send us a message</p>
      <h2 className="title mt-3 text-blue-600">
        Tell us what you&apos;re working on.
      </h2>
      <p className="mt-6 max-w-xl text-body text-gray-700">
        Fill in the form — a real student officer reads it and replies.
      </p>

      <form className="mt-10 flex flex-col gap-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Full name" placeholder="Your Name" />
          <FormField label="Email" type="email" placeholder="you@gmail.edu.au" />
          <FormField label="Affiliation" placeholder="University, company, or society " />

          {/* Select — FormField is input-only, so rendered inline with matching styles */}
          <div className="flex flex-col gap-2">
            <label htmlFor="state" className={labelClass}>
              State chapter
            </label>
            <select id="state" defaultValue="VIC — Victoria" className={fieldClass}>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic chips */}
        <fieldset className="flex flex-col">
          <legend className={labelClass}>What&apos;s it about?</legend>
          <div className="flex flex-wrap gap-4 mt-2">
            {TOPICS.map((t) => {
              const active = topic === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTopic(t)}
                  className={`rounded-pill border-2 px-5 py-2 text-body-sm font-bold transition-colors ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-blue-100 text-blue-600 hover:border-blue-600"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className={labelClass}>
            Your message
          </label>
          <textarea id="message" rows={6} className={`${fieldClass} resize-y`} />
        </div>

        {/* Consent */}
        <label className="flex items-center gap-3 text-body-sm text-gray-700">
          <input
            type="checkbox"
            checked={keepOnFile}
            onChange={(e) => setKeepOnFile(e.target.checked)}
            className="mt-1 h-5 w-5 accent-blue-600"
          />
          <span>
            I&apos;m happy for MASCA to keep my details on file and send me occasional
            updates. We never share with third parties — see our{" "}
            <a href="/privacy" className="font-bold text-blue-600 underline">
              privacy notice
            </a>
            .
          </span>
        </label>

        {/* Submit */}
        <div className="flex flex-wrap items-center gap-5">
          <Button variant="accent" type="submit">
            Send message →
          </Button>
        </div>

      </form>
    </section>
  );
}