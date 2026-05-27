import type { Metadata } from "next";

import { ContactSection } from "./contactForm";

export const metadata: Metadata = {
  title: "Contact MASCA",
  description: "Get in touch with MASCA — a real student officer reads every message.",
};

export default function ContactPage() {
  return (
    <main>
      <ContactSection />
    </main>
  );
}