import type { Metadata } from "next";

import HeroSection from "./sections/hero";
import UpcomingEvent from "./sections/upcomingEvent";
import StatesSection from "./sections/states";
import EventShowcaseSection from "./sections/eventShowcase";
import MascaCareSection from "./sections/mascaCare";
import MascaVoiceSection from "./sections/mascaVoice";
import YearbookSection from "./sections/yearbook";
import AboutSection from "./sections/about";
import SponsorsSection from "./sections/sponsors";
import JoinUsSection from "./sections/joinUs";
import { getSponsors } from "@/utils/sponsors";

export const metadata: Metadata = {
  title: "Home | MASCA",
  description: "The Malaysian Students' Council of Australia (MASCA) is the official, peak student representative body for Malaysian students in Australia. Established in April 2001, it operates as a non-profit organization across six states and one territory to advocate for students' welfare, promote academic excellence, and celebrate Malaysian culture.",
};

export default async function Home() {
  const sponsors = await getSponsors();

  return (
   <main>
      <HeroSection upcomingEvent={<UpcomingEvent />} />
      <AboutSection />
      <YearbookSection />
      <StatesSection />
      <EventShowcaseSection />
      <MascaVoiceSection />
      <MascaCareSection />
      <SponsorsSection sponsors={sponsors} />
      <JoinUsSection />
    </main>
  );
}